import { injectable, inject } from 'tsyringe';
import { BaseService } from '../../../lib/services/base.service';
import { TYPES } from '../../../lib/types';
import { StorageResult, StorageFile, IImageStorageService } from './types';
import { StorageError, UploadError, DownloadError, DeleteError } from './errors';
import { retryOperation } from './retry';
import { STORAGE_CONFIG, STORAGE_PATHS } from './config';
import { createServerSupabase } from '../../../lib/supabase';
import { Logger } from 'winston';
import { ImageMetadata } from '../validation/types';

@injectable()
export class ImageStorageService extends BaseService implements IImageStorageService {
  constructor(
    @inject(TYPES.Logger) protected readonly logger: Logger
  ) {
    super(logger, 'ImageStorageService');
  }

  async uploadFile(
    file: Buffer,
    userId: string,
    projectId: string,
    metadata: Record<string, unknown> = {}
  ): Promise<StorageResult> {
    return await retryOperation(
      async () => {
        try {
          // Get the original filename or use a default
          const originalName = metadata.originalName as string || 'image';
          
          // Use the original filename in the path
          const path = STORAGE_PATHS.projectImage(userId, projectId, originalName);
          
          this.logger.info('Uploading file to storage', {
            userId,
            projectId,
            originalName,
            path,
            timestamp: new Date().toISOString()
          });
          
          const supabase = createServerSupabase();
          
          const { error: uploadError } = await supabase.storage
            .from(STORAGE_CONFIG.buckets.primary)
            .upload(path, file, {
              upsert: true,
              contentType: metadata.contentType as string
            });

          if (uploadError) throw uploadError;

          const { data: urlData } = await supabase.storage
            .from(STORAGE_CONFIG.buckets.primary)
            .getPublicUrl(path);

          // Convert metadata to ImageMetadata
          const imageMetadata: ImageMetadata = {
            userId: typeof metadata.userId === 'string' ? metadata.userId : userId,
            type: 'image',
            size: typeof metadata.size === 'number' ? metadata.size : file.length,
            path,
            contentType: typeof metadata.contentType === 'string' ? metadata.contentType : 'image/jpeg',
            mimeType: typeof metadata.mimeType === 'string' ? metadata.mimeType : 'image/jpeg',
            dimensions: metadata.dimensions as { width: number; height: number } || { width: 0, height: 0 }
          };

          return {
            url: urlData.publicUrl,
            path,
            bucket: STORAGE_CONFIG.buckets.primary,
            metadata: imageMetadata
          };
        } catch (error) {
          throw new UploadError('Failed to upload file', { cause: error });
        }
      },
      'uploadFile',
      this.logger
    );
  }

  async deleteFile(userId: string, projectId: string): Promise<void> {
    await retryOperation(
      async () => {
        try {
          // For deletion, we need to list all files in the directory first
          // since we don't know the exact filename
          const directoryPath = `${userId}/${projectId}`;
          const supabase = createServerSupabase();
          
          this.logger.info('Listing files for deletion', {
            userId,
            projectId,
            directoryPath,
            timestamp: new Date().toISOString()
          });
          
          // First list all files in the directory
          const { data: files, error: listError } = await supabase.storage
            .from(STORAGE_CONFIG.buckets.primary)
            .list(directoryPath);
            
          if (listError) throw listError;
          
          if (!files || files.length === 0) {
            this.logger.warn('No files found for deletion', {
              userId,
              projectId,
              directoryPath,
              timestamp: new Date().toISOString()
            });
            return;
          }
          
          // Create full paths for each file
          const filePaths = files.map((file: any) => `${directoryPath}/${file.name}`);
          
          this.logger.info('Deleting files', {
            userId,
            projectId,
            fileCount: filePaths.length,
            filePaths,
            timestamp: new Date().toISOString()
          });
          
          // Delete all files
          const { error } = await supabase.storage
            .from(STORAGE_CONFIG.buckets.primary)
            .remove(filePaths);

          if (error) throw error;
          
          this.logger.info('Files deleted successfully', {
            userId,
            projectId,
            fileCount: filePaths.length,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          throw new DeleteError('Failed to delete file', { cause: error });
        }
      },
      'deleteFile',
      this.logger
    );
  }

  async fileExists(userId: string, projectId: string): Promise<boolean> {
    return await retryOperation(
      async () => {
        try {
          const path = STORAGE_PATHS.projectImage(userId, projectId);
          const supabase = createServerSupabase();
          
          const { data, error } = await supabase.storage
            .from(STORAGE_CONFIG.buckets.primary)
            .list(path);

          if (error) throw error;
          return data && data.length > 0;
        } catch (error) {
          throw new StorageError('Failed to check file existence', { cause: error });
        }
      },
      'fileExists',
      this.logger
    );
  }

  async downloadFile(userId: string, projectId: string): Promise<Buffer> {
    return await retryOperation(
      async () => {
        try {
          const path = STORAGE_PATHS.projectImage(userId, projectId);
          const supabase = createServerSupabase();
          
          const { data, error } = await supabase.storage
            .from(STORAGE_CONFIG.buckets.primary)
            .download(path);

          if (error) throw error;
          if (!data) throw new Error('No data received');

          return Buffer.from(await data.arrayBuffer());
        } catch (error) {
          throw new DownloadError('Failed to download file', { cause: error });
        }
      },
      'downloadFile',
      this.logger
    );
  }

  async listFiles(directory: string): Promise<StorageFile[]> {
    return await retryOperation(
      async () => {
        try {
          const supabase = createServerSupabase();
          const { data, error } = await supabase.storage
            .from(STORAGE_CONFIG.buckets.primary)
            .list(directory);

          if (error) throw error;
          
          return data?.map((item: any) => ({
            path: item.name,
            lastModified: new Date(item.metadata?.lastModified || Date.now()),
            userId: this.extractUserId(item.name),
            size: item.metadata?.size,
            metadata: item.metadata
          })) || [];
        } catch (error) {
          throw new StorageError('Failed to list files', { cause: error });
        }
      },
      'listFiles',
      this.logger
    );
  }

  async getFileSize(path: string): Promise<number> {
    return await retryOperation(
      async () => {
        try {
          const supabase = createServerSupabase();
          const { data, error } = await supabase.storage
            .from(STORAGE_CONFIG.buckets.primary)
            .download(path);

          if (error) throw error;
          if (!data) return 0;

          const buffer = await data.arrayBuffer();
          return buffer.byteLength;
        } catch (error) {
          throw new StorageError('Failed to get file size', { cause: error });
        }
      },
      'getFileSize',
      this.logger
    );
  }

  private extractUserId(path: string): string | undefined {
    const pathParts = path.split('/');
    return pathParts.length > 0 ? pathParts[0] : undefined;
  }
} 