import { ServiceResult } from '../../../types';

/**
 * Image validation configuration
 */
export interface ImageValidationConfig {
  maxSizeBytes: number;
  allowedTypes: string[];
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
}

/**
 * Result of image validation
 */
export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
  metadata?: ImageMetadata;
}

/**
 * Image metadata extracted during validation
 */
export interface ImageMetadata {
  /** Image dimensions in pixels */
  dimensions: ImageDimensions;
  /** File size in bytes */
  size: number;
  /** File type (e.g., 'image/jpeg') */
  type: string;
  /** File MIME type */
  mimeType: string;
  /** File hash (MD5) */
  hash?: string;
  /** Additional metadata properties */
  [key: string]: unknown;
}

/**
 * Validation rules for specific image types
 */
export interface ValidationRules {
  mimeType: string[];
  maxSize: number;
  dimensions: {
    min: { width: number; height: number };
    max: { width: number; height: number };
  };
}

/**
 * Service interface for image validation
 */
export interface IImageValidationService {
  validateImage(file: Buffer, filename: string): Promise<ServiceResult<ValidationResult>>;
  validateMetadata(metadata: ImageMetadata): ValidationResult;
  getImageMetadata(file: Buffer): Promise<ImageMetadata>;
}

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface ImageValidationResult {
  isValid: boolean;
  errors: string[];
  dimensions?: ImageDimensions;
  size?: number;
  type?: string;
  metadata?: {
    mimeType?: string;
    hash?: string;
  };
}

/**
 * Default validation configuration
 */
export const DEFAULT_VALIDATION_CONFIG: ImageValidationConfig = {
  maxSizeBytes: 10 * 1024 * 1024, // 10MB
  minWidth: 100,
  minHeight: 100,
  maxWidth: 8192,
  maxHeight: 8192,
  allowedTypes: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif'
  ]
};

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  INVALID_SIZE: 'File size exceeds the maximum allowed limit',
  INVALID_TYPE: 'File type is not supported',
  INVALID_DIMENSIONS: 'Image dimensions are outside allowed range',
  CORRUPTED_FILE: 'File appears to be corrupted or invalid',
  PROCESSING_ERROR: 'Error processing image file'
} as const; 