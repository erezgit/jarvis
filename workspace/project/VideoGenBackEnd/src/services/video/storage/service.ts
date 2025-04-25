import { createServerSupabase } from '../../../lib/supabase';
import { logger } from '../../../lib/server/logger';
import { StorageConfig, StorageResult, UploadFileParams } from './types';
import { VideoStorageError } from '../errors';
import { STORAGE_CONFIG } from '../../../config/storage';
import { BucketName } from '../../../config/storage/buckets';
import { VideoMetadata } from '../types';

/**
 * Service for handling storage operations
 */
export class StorageService {
  async uploadFile(params: UploadFileParams): Promise<StorageResult> {
    try {
      logger.info('Starting storage upload', {
        fileName: params.fileName,
        contentType: params.contentType,
        userId: params.userId,
        projectId: params.projectId,
        timestamp: new Date().toISOString()
      });

      const supabase = createServerSupabase();

      // Determine bucket based on content type
      const bucket = this.getBucketForContentType(params.contentType);
      const fileName = params.fileName.split('/').pop() || params.fileName; // Get just the filename without path
      const path = `${params.userId}/${params.projectId}/${fileName}`;

      // Convert to proper format for Supabase
      const content = this.convertToUploadContent(params.file, params.contentType);

      // Upload file
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, content, {
          contentType: params.contentType,
          upsert: true,
          ...(params.metadata && { metadata: params.metadata })
        });

      if (error) {
        logger.error('Storage upload failed', {
          error,
          fileName: params.fileName,
          path,
          timestamp: new Date().toISOString()
        });
        throw new VideoStorageError('Failed to upload file', { error: error.message });
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      logger.info('Storage upload successful', {
        path: data.path,
        url: urlData.publicUrl,
        timestamp: new Date().toISOString()
      });

      // Create VideoMetadata from params
      const metadata: VideoMetadata = {
        contentType: params.contentType,
        size: params.file.length,
        dimensions: params.dimensions,
        duration: params.duration,
        ...(params.metadata as Partial<VideoMetadata>)
      };

      return {
        url: urlData.publicUrl,
        path: data.path,
        bucket,
        metadata
      };
    } catch (error) {
      logger.error('Storage operation failed', {
        error,
        fileName: params.fileName,
        isStorageError: error instanceof VideoStorageError,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });

      if (error instanceof VideoStorageError) {
        throw error;
      }
      throw new VideoStorageError('Storage operation failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private getBucketForContentType(contentType: string): BucketName {
    if (contentType.startsWith('image/')) {
      return 'images';
    }
    if (contentType.startsWith('video/')) {
      return 'videos';
    }
    throw new VideoStorageError('Unsupported content type', { contentType });
  }

  private convertToUploadContent(data: Buffer | Uint8Array, contentType: string): Blob {
    // Validate input
    if (!data || data.length === 0) {
      logger.error('Invalid data provided to convertToUploadContent', {
        hasData: !!data,
        length: data?.length,
        contentType,
        dataType: data?.constructor.name
      });
      throw new VideoStorageError('Invalid or empty data provided');
    }

    // Ensure we have a Buffer
    let buffer: Buffer;
    if (Buffer.isBuffer(data)) {
      buffer = data;
    } else if (data instanceof Uint8Array) {
      buffer = Buffer.from(data);
    } else {
      logger.error('Unexpected data type in convertToUploadContent', {
        type: (data as Buffer | Uint8Array).constructor.name,
        length: (data as Buffer | Uint8Array).length,
        contentType
      });
      throw new VideoStorageError('Invalid data type provided');
    }

    // Validate buffer content
    if (buffer.length === 0) {
      logger.error('Empty buffer after conversion', {
        originalLength: data.length,
        bufferLength: buffer.length,
        contentType
      });
      throw new VideoStorageError('Buffer is empty after conversion');
    }

    // Log buffer details for debugging
    logger.info('Buffer prepared for blob conversion', {
      bufferType: buffer.constructor.name,
      bufferLength: buffer.length,
      contentType,
      firstBytes: buffer.slice(0, 16).toString('hex')
    });

    // Create ArrayBuffer from Buffer for Blob creation
    const arrayBuffer = buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength
    );

    // Create and validate Blob
    const blob = new Blob([arrayBuffer], { type: contentType });
    
    // Verify blob creation
    if (blob.size === 0) {
      logger.error('Created blob is empty', {
        bufferLength: buffer.length,
        arrayBufferLength: arrayBuffer.byteLength,
        blobSize: blob.size,
        contentType
      });
      throw new VideoStorageError('Created blob is empty');
    }

    logger.info('Blob created successfully', {
      blobSize: blob.size,
      blobType: blob.type,
      bufferLength: buffer.length,
      timestamp: new Date().toISOString()
    });

    return blob;
  }

  async deleteFile(bucket: string, path: string): Promise<void> {
    try {
      logger.info('Starting file deletion', {
        bucket,
        path,
        timestamp: new Date().toISOString()
      });

      const supabase = createServerSupabase();
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        logger.error('File deletion failed', {
          error,
          bucket,
          path,
          timestamp: new Date().toISOString()
        });
        throw new VideoStorageError('Failed to delete file', { error: error.message });
      }

      logger.info('File deletion successful', {
        bucket,
        path,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('File deletion operation failed', {
        error,
        bucket,
        path,
        isStorageError: error instanceof VideoStorageError,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });

      if (error instanceof VideoStorageError) {
        throw error;
      }
      throw new VideoStorageError('File deletion failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async getFileUrl(bucket: string, path: string): Promise<string> {
    try {
      logger.info('Getting file URL', {
        bucket,
        path,
        timestamp: new Date().toISOString()
      });

      const supabase = createServerSupabase();
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      return data.publicUrl;
    } catch (error) {
      logger.error('Failed to get file URL', {
        error,
        bucket,
        path,
        isStorageError: error instanceof VideoStorageError,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });

      throw new VideoStorageError('Failed to get file URL', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async verifyFileExists(url: string): Promise<boolean> {
    try {
      logger.info('Verifying file exists', {
        url,
        timestamp: new Date().toISOString()
      });

      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      logger.error('Failed to verify file exists', {
        error,
        url,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      return false;
    }
  }
} 