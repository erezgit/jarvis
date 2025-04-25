import { injectable, inject } from 'tsyringe';
import { Logger } from 'winston';
import { BaseService } from '../../../lib/services/base.service';
import { TYPES } from '../../../lib/types';
import { ServiceResult } from '../../../types';
import {
  IImageValidationService,
  ImageMetadata,
  ValidationResult,
  ImageValidationConfig,
  DEFAULT_VALIDATION_CONFIG,
  ERROR_MESSAGES
} from './types';

let sharp: any;
try {
  // Dynamic import for sharp since it's optional in development
  sharp = require('sharp');
} catch (e) {
  console.warn('Sharp module not available. Image validation will be limited.');
}

@injectable()
export class ImageValidationService extends BaseService implements IImageValidationService {
  private config: ImageValidationConfig = DEFAULT_VALIDATION_CONFIG;

  constructor(
    @inject(TYPES.Logger) protected readonly logger: Logger
  ) {
    super(logger, 'ImageValidationService');
  }

  /**
   * Validate an image file
   */
  async validateImage(file: Buffer, filename: string): Promise<ServiceResult<ValidationResult>> {
    try {
      // Get image metadata
      const metadata = await this.getImageMetadata(file);

      // Validate metadata
      const result = this.validateMetadata(metadata);

      return {
        success: true,
        data: {
          isValid: result.isValid,
          errors: result.errors,
          metadata
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Unknown error')
      };
    }
  }

  /**
   * Validate image metadata against configuration
   */
  validateMetadata(metadata: ImageMetadata): ValidationResult {
    const errors: string[] = [];

    // Validate file size
    if (metadata.size > this.config.maxSizeBytes) {
      errors.push(ERROR_MESSAGES.INVALID_SIZE);
    }

    // Validate type
    if (!this.config.allowedTypes.includes(metadata.type)) {
      errors.push(ERROR_MESSAGES.INVALID_TYPE);
    }

    // Validate dimensions
    if (
      metadata.dimensions.width < this.config.minWidth ||
      metadata.dimensions.width > this.config.maxWidth ||
      metadata.dimensions.height < this.config.minHeight ||
      metadata.dimensions.height > this.config.maxHeight
    ) {
      errors.push(ERROR_MESSAGES.INVALID_DIMENSIONS);
    }

    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      metadata
    };
  }

  /**
   * Extract metadata from image file
   */
  async getImageMetadata(file: Buffer): Promise<ImageMetadata> {
    try {
      if (!sharp) {
        throw new Error('Sharp module not available');
      }

      const image = sharp(file);
      const metadata = await image.metadata();

      if (!metadata.width || !metadata.height || !metadata.format) {
        throw new Error('Invalid image format');
      }

      const type = `image/${metadata.format}`;
      const imageMetadata: ImageMetadata = {
        dimensions: {
          width: metadata.width,
          height: metadata.height
        },
        size: file.length,
        type,
        mimeType: type,
        hash: undefined // Will be set by the service layer
      };

      return imageMetadata;
    } catch (error) {
      this.logger.error('Failed to extract image metadata', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  /**
   * Update validation configuration
   */
  updateConfig(config: Partial<ImageValidationConfig>): void {
    this.config = { ...this.config, ...config };
  }
} 