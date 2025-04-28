import { ErrorCode, HttpStatus } from '../../types/errors';
import { ServiceResult } from '../../types';
import { UploadedFile } from 'express-fileupload';
import { UploadResponse, FileMetadata } from '../../lib/storage/types';
import { DbResult } from '../../lib/db/types';
import { ValidationResult } from '../../types/validation';

// Service interfaces
export interface IImageService {
  uploadProjectImage(file: UploadedFile, userId: string): Promise<ServiceResult<ProjectImageUploadResult>>;
  getProjectStatus(projectId: string, userId: string): Promise<ServiceResult<ProjectStatusResult>>;
  uploadImage(file: Buffer, metadata: ImageMetadata): Promise<ImageUploadResult>;
  validateImage(file: Buffer): Promise<ImageValidationResult>;
  deleteImage(imageId: string): Promise<void>;
  getImageMetadata(imageId: string): Promise<ImageMetadata>;
}

export interface IImageRepository {
  createProject(userId: string, imageUrl: string): Promise<DbResult<DbImage>>;
  updateImageUrl(projectId: string, imageUrl: string): Promise<DbResult<void>>;
  getProject(projectId: string, userId: string): Promise<DbResult<DbImage>>;
}

// Database types
export interface DbImage {
  id: string;
  project_id: string;
  user_id: string;
  image_url: string | null;
  title: string | null;
  created_at: string;
  updated_at: string;
}

// API Response types
export interface ProjectImageUploadResult {
  success: boolean;
  projectId?: string;
  imageUrl?: string;
  error?: {
    code: string;
    message: string;
  };
}

export interface ProjectStatusResult {
  success: boolean;
  status: 'completed' | 'pending';
  imageUrl: string | null;
  error?: {
    code: string;
    message: string;
  };
}

// Validation types
export interface ImageValidationResult extends ValidationResult<ImageMetadata> {
  // Additional image-specific validation properties can be added here
}

/**
 * Image metadata interface
 * Extends FileMetadata with image-specific properties
 */
export interface ImageMetadata extends FileMetadata {
  /**
   * Image dimensions
   */
  dimensions: {
    width: number;
    height: number;
  };
  
  /**
   * Type of the metadata - always 'image' for image metadata
   */
  type: 'image';
  
  /**
   * User ID associated with the image
   */
  userId: string;
  
  /**
   * Optional project ID associated with the image
   */
  projectId?: string;
}

// Storage types
export interface StorageConfig {
  buckets: {
    images: string;
    temp: string;
  };
  retryConfig: {
    maxRetries: number;
    initialDelayMs: number;
    maxDelayMs: number;
    backoffFactor: number;
  };
  uploadConfig: {
    chunkSize: number;
    timeoutMs: number;
    maxConcurrentUploads: number;
  };
  cleanupConfig: {
    tempFilesTTL: number;
    orphanedFilesTTL: number;
    cleanupIntervalMs: number;
  };
}

export interface UploadProgress {
  bytesUploaded: number;
  totalBytes: number;
  percentage: number;
  status: 'uploading' | 'completed' | 'failed';
  error?: string;
}

// Configuration types
export interface ImageConfig {
  maxSizeBytes: number;
  allowedTypes: string[];
  allowedExtensions: string[];
}

// Error types
export enum ImageErrorCode {
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  STORAGE_ERROR = 'STORAGE_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  INVALID_FORMAT = 'INVALID_FORMAT',
  SIZE_TOO_LARGE = 'SIZE_TOO_LARGE'
}

// Constants
export const IMAGE_REQUIREMENTS = {
  maxSizeBytes: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'] as const
};

/**
 * Data required to create a new image record
 */
export interface DbImageCreate {
  project_id: string;
  user_id: string;
  image_url: string;
}

/**
 * Data for updating an image record
 */
export interface DbImageUpdate {
  image_url: string;
}

/**
 * Image-specific upload response
 */
export interface ImageUploadResponse extends UploadResponse {
  dimensions?: {
    width: number;
    height: number;
  };
  thumbnailUrl?: string;
}

/**
 * Image upload result
 */
export interface ImageUploadResult {
  url: string;
  path: string;
  bucket: string;
  thumbnailUrl?: string;
  metadata: ImageMetadata;
} 