import { injectable, inject } from 'tsyringe';
import { Logger } from 'winston';
import { BaseService } from '../../lib/services/base.service';
import { TYPES } from '../../lib/types';
import { ServiceResult } from '../../types';
import { UploadedFile } from 'express-fileupload';
import { ImageValidationService } from './validation';
import { ImageStorageService } from './storage/service';
import { ImageRepository } from './repository';
import { CleanupService } from './cleanup/service';
import fs from 'fs';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';
import {
  IImageService,
  ProjectImageUploadResult,
  ProjectStatusResult,
  ImageValidationResult,
  IMAGE_REQUIREMENTS,
  ImageErrorCode,
  UploadProgress,
  DbImageCreate,
  ImageMetadata,
  ImageUploadResult
} from './types';
import {
  ImageError,
  ImageValidationError,
  InvalidImageFormatError,
  ImageSizeTooLargeError
} from './errors';

// Promisify fs.readFile
const readFile = promisify(fs.readFile);

@injectable()
export class ImageService extends BaseService implements IImageService {
  constructor(
    @inject(TYPES.Logger) protected readonly logger: Logger,
    @inject(TYPES.ImageValidationService) private readonly validationService: ImageValidationService,
    @inject(TYPES.ImageStorageService) private readonly storageService: ImageStorageService,
    @inject(TYPES.ImageRepository) private readonly repository: ImageRepository,
    @inject(TYPES.ImageCleanupService) private readonly cleanupService: CleanupService
  ) {
    super(logger, 'ImageService');
    this.initializeCleanup();
  }

  private initializeCleanup(): void {
    // Start scheduled cleanup
    this.cleanupService.startScheduledCleanup();

    // Log cleanup stats periodically
    setInterval(() => {
      const stats = this.cleanupService.getStats();
      this.logger.info('Cleanup service stats', {
        totalCleanups: stats.totalCleanups,
        successfulCleanups: stats.successfulCleanups,
        failedCleanups: stats.failedCleanups,
        lastRunStats: stats.lastRunStats,
        timestamp: new Date().toISOString()
      });
    }, 24 * 60 * 60 * 1000); // Daily stats logging
  }

  /**
   * Upload and validate a project image
   */
  async uploadProjectImage(
    file: UploadedFile,
    userId: string
  ): Promise<ServiceResult<ProjectImageUploadResult>> {
    try {
      // Get file data - handle both in-memory and temp file cases
      let fileData: Buffer;
      
      if (file.tempFilePath) {
        // File is stored on disk (useTempFiles: true)
        this.logger.info('Reading file from temp path', {
          tempFilePath: file.tempFilePath,
          size: file.size,
          timestamp: new Date().toISOString()
        });
        
        try {
          fileData = await readFile(file.tempFilePath);
        } catch (readError) {
          this.logger.error('Failed to read temp file', {
            error: readError instanceof Error ? readError.message : 'Unknown error',
            tempFilePath: file.tempFilePath,
            timestamp: new Date().toISOString()
          });
          throw new Error('Failed to read uploaded file');
        }
      } else if (file.data) {
        // File is in memory
        fileData = file.data;
      } else {
        this.logger.error('No file data available', {
          hasData: !!file.data,
          hasTempPath: !!file.tempFilePath,
          size: file.size,
          timestamp: new Date().toISOString()
        });
        throw new Error('No file data available');
      }
      
      // Validate the image
      const validationResult = await this.validationService.validateImage(
        fileData,
        file.name
      );

      if (!validationResult.success || !validationResult.data?.isValid) {
        // Schedule cleanup of any temporary files
        await this.cleanupService.cleanupTempFiles().catch(error => {
          this.logger.error('Failed to cleanup temp files after validation failure', {
            error: error instanceof Error ? error.message : 'Unknown error',
            userId,
            filename: file.name,
            timestamp: new Date().toISOString()
          });
        });

        return {
          success: false,
          error: validationResult.error || new ImageValidationError('Image validation failed')
        };
      }

      // Generate a proper UUID for the project
      const projectId = uuidv4();
      
      this.logger.info('Generated project ID for image upload', {
        projectId,
        userId,
        filename: file.name,
        timestamp: new Date().toISOString()
      });

      // Upload to storage
      const uploadResult = await this.storageService.uploadFile(
        fileData,
        userId,
        projectId,
        {
          contentType: validationResult.data.metadata?.mimeType || file.mimetype,
          originalName: file.name,
          size: file.size,
          metadata: validationResult.data.metadata
        }
      );

      // Create database record
      const imageData: DbImageCreate = {
        project_id: projectId,
        user_id: userId,
        image_url: uploadResult.url
      };

      const { data: dbImage, error: dbError } = await this.repository.createImage(imageData);

      if (dbError || !dbImage) {
        // Cleanup uploaded file if database operation fails
        await this.storageService.deleteFile(userId, projectId);
        return {
          success: false,
          error: dbError || new Error('Failed to create image record')
        };
      }

      // Log the successful response
      this.logger.info('Image upload completed successfully', {
        projectId,
        userId,
        imageUrl: uploadResult.url,
        timestamp: new Date().toISOString()
      });

      return {
        success: true,
        data: {
          success: true,
          projectId,
          imageUrl: uploadResult.url
        }
      };

    } catch (error) {
      // Schedule cleanup in case of failure
      await this.cleanupService.cleanup().catch(cleanupError => {
        this.logger.error('Failed to run cleanup after upload failure', {
          error: cleanupError instanceof Error ? cleanupError.message : 'Unknown error',
          userId,
          filename: file.name,
          timestamp: new Date().toISOString()
        });
      });

      this.logger.error('Failed to upload project image', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        filename: file.name,
        timestamp: new Date().toISOString()
      });

      return {
        success: false,
        error: error instanceof Error ? error : new Error('Failed to upload image')
      };
    }
  }

  /**
   * Get project image status
   */
  async getProjectStatus(
    projectId: string,
    userId: string
  ): Promise<ServiceResult<ProjectStatusResult>> {
    try {
      const { data: image, error } = await this.repository.getImageByProjectId(projectId, userId);

      if (error || !image) {
        return {
          success: false,
          error: error || new Error('Failed to get project status')
        };
      }

      return {
        success: true,
        data: {
          success: true,
          status: image.image_url ? 'completed' : 'pending',
          imageUrl: image.image_url
        }
      };

    } catch (error) {
      this.logger.error('Failed to get project status', {
        error: error instanceof Error ? error.message : 'Unknown error',
        projectId,
        userId,
        timestamp: new Date().toISOString()
      });

      return {
        success: false,
        error: error instanceof Error ? error : new Error('Failed to get project status')
      };
    }
  }

  /**
   * Delete project image
   */
  async deleteProjectImage(
    projectId: string,
    userId: string
  ): Promise<ServiceResult<void>> {
    try {
      // Get current image URL
      const { data: currentImage, error: getError } = await this.repository.getImageByProjectId(projectId, userId);
      
      if (getError || !currentImage?.image_url) {
        return {
          success: false,
          error: getError || new Error('No image found to delete')
        };
      }

      // Delete from storage
      await this.storageService.deleteFile(userId, currentImage.image_url);

      // Update database
      const { error: deleteError } = await this.repository.deleteImage(projectId, userId);

      if (deleteError) {
        return {
          success: false,
          error: deleteError || new Error('Failed to update database record')
        };
      }

      // Run cleanup to handle any orphaned files
      await this.cleanupService.cleanup().catch(cleanupError => {
        this.logger.error('Failed to run cleanup after image deletion', {
          error: cleanupError instanceof Error ? cleanupError.message : 'Unknown error',
          projectId,
          userId,
          timestamp: new Date().toISOString()
        });
      });

      return {
        success: true
      };

    } catch (error) {
      this.logger.error('Failed to delete project image', {
        error: error instanceof Error ? error.message : 'Unknown error',
        projectId,
        userId,
        timestamp: new Date().toISOString()
      });

      return {
        success: false,
        error: error instanceof Error ? error : new Error('Failed to delete image')
      };
    }
  }

  /**
   * Validate uploaded file
   */
  private async validateFile(file: UploadedFile): Promise<ImageValidationResult> {
    // Check file size
    if (file.size > IMAGE_REQUIREMENTS.maxSizeBytes) {
      throw new ImageSizeTooLargeError(file.size, IMAGE_REQUIREMENTS.maxSizeBytes);
    }

    // Check file type
    const mimeType = file.mimetype as 'image/jpeg' | 'image/png' | 'image/webp';
    if (!IMAGE_REQUIREMENTS.allowedTypes.includes(mimeType)) {
      throw new InvalidImageFormatError(
        `Invalid file type: ${mimeType}. Allowed types: ${IMAGE_REQUIREMENTS.allowedTypes.join(', ')}`
      );
    }

    // Check file extension
    const extension = `.${file.name.split('.').pop()?.toLowerCase()}` as '.jpg' | '.jpeg' | '.png' | '.webp';
    if (!IMAGE_REQUIREMENTS.allowedExtensions.includes(extension)) {
      throw new InvalidImageFormatError(
        `Invalid file extension: ${extension}. Allowed extensions: ${IMAGE_REQUIREMENTS.allowedExtensions.join(', ')}`
      );
    }

    return {
      isValid: true,
      errors: []
    };
  }

  /**
   * Upload an image directly from a buffer with metadata
   */
  async uploadImage(file: Buffer, metadata: ImageMetadata): Promise<ImageUploadResult> {
    try {
      // Ensure userId is a string
      const userId = typeof metadata.userId === 'string' ? metadata.userId : '';
      
      const uploadResult = await this.storageService.uploadFile(
        file,
        userId,
        metadata.hash || '',
        {
          contentType: metadata.mimeType,
          size: file.length,
          metadata: {
            ...metadata,
            contentType: metadata.mimeType
          }
        }
      );

      return {
        url: uploadResult.url,
        path: uploadResult.path,
        bucket: uploadResult.bucket,
        metadata: {
          ...metadata,
          contentType: metadata.mimeType
        }
      };
    } catch (error) {
      this.logger.error('Failed to upload image from buffer', {
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata,
        timestamp: new Date().toISOString()
      });
      throw error instanceof Error ? error : new Error('Failed to upload image');
    }
  }

  /**
   * Validate an image buffer
   */
  async validateImage(file: Buffer): Promise<ImageValidationResult> {
    try {
      const validationResult = await this.validationService.validateImage(file, '');
      if (!validationResult.success || !validationResult.data) {
        return {
          isValid: false,
          errors: [validationResult.error?.message || 'Validation failed']
        };
      }

      // Ensure we always return an errors array, even if empty
      const errors = validationResult.data.errors || [];
      
      // Create a properly typed metadata object
      let metadata: ImageMetadata | undefined = undefined;
      
      if (validationResult.data.metadata) {
        metadata = {
          ...validationResult.data.metadata,
          contentType: validationResult.data.metadata.mimeType,
          type: 'image',
          userId: typeof validationResult.data.metadata.userId === 'string' 
            ? validationResult.data.metadata.userId 
            : '',
          dimensions: validationResult.data.metadata.dimensions || { width: 0, height: 0 },
          size: typeof validationResult.data.metadata.size === 'number' 
            ? validationResult.data.metadata.size 
            : 0,
          mimeType: validationResult.data.metadata.mimeType
        };
      }
      
      return {
        isValid: validationResult.data.isValid,
        errors,
        metadata
      };
    } catch (error) {
      this.logger.error('Failed to validate image', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      return {
        isValid: false,
        errors: [error instanceof Error ? error.message : 'Unknown validation error']
      };
    }
  }

  /**
   * Delete an image by ID
   */
  async deleteImage(imageId: string): Promise<void> {
    try {
      const { data: image, error: getError } = await this.repository.getImageByProjectId(imageId, '');
      
      if (getError || !image || !image.image_url) {
        throw getError || new Error('Image not found');
      }

      await this.storageService.deleteFile(image.user_id, image.image_url);
      await this.repository.deleteImage(imageId, image.user_id);
    } catch (error) {
      this.logger.error('Failed to delete image', {
        error: error instanceof Error ? error.message : 'Unknown error',
        imageId,
        timestamp: new Date().toISOString()
      });
      throw error instanceof Error ? error : new Error('Failed to delete image');
    }
  }

  /**
   * Get image metadata by ID
   */
  async getImageMetadata(imageId: string): Promise<ImageMetadata> {
    try {
      const { data: image, error: getError } = await this.repository.getImageByProjectId(imageId, '');
      
      if (getError || !image || !image.image_url) {
        throw getError || new Error('Image not found');
      }

      // Since we don't have direct access to file metadata,
      // construct it from available information
      return {
        userId: image.user_id,
        mimeType: 'image/jpeg', // Default, should be stored in DB
        dimensions: {
          width: 0, // Should be stored in DB
          height: 0 // Should be stored in DB
        },
        contentType: 'image/jpeg', // Default, should be stored in DB
        size: 0, // Should be stored in DB
        path: image.image_url,
        type: 'image'
      };
    } catch (error) {
      this.logger.error('Failed to get image metadata', {
        error: error instanceof Error ? error.message : 'Unknown error',
        imageId,
        timestamp: new Date().toISOString()
      });
      throw error instanceof Error ? error : new Error('Failed to get image metadata');
    }
  }
} 