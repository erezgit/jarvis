import { BucketName } from '../../../config/storage/buckets';
import { ImageMetadata } from '../validation/types';
import { StorageConfig as CoreStorageConfig, StorageResult as CoreStorageResult, UploadFileParams as CoreUploadFileParams } from '../../core/storage/types';

/**
 * Allowed image MIME types
 */
export type AllowedImageMimeType = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';

/**
 * Image storage configuration
 */
export interface StorageConfig {
  buckets: {
    primary: string;
    temp: string;
  };
  retryConfig: {
    maxRetries: number;
    initialDelayMs: number;
    maxDelayMs: number;
    backoffFactor: number;
  };
}

/**
 * Image storage result
 */
export interface StorageResult {
  url: string;
  path: string;
  bucket: string;
  metadata: ImageMetadata;
}

/**
 * Image upload parameters
 */
export interface UploadFileParams extends CoreUploadFileParams {
  dimensions?: {
    width: number;
    height: number;
  };
}

/**
 * Upload progress interface
 */
export interface UploadProgress {
  bytesUploaded: number;
  totalBytes: number;
  percentage: number;
  status: 'uploading' | 'completed' | 'failed';
  error?: string;
}

/**
 * Image storage provider interface
 */
export interface IImageStorageProvider {
  uploadImage(params: UploadFileParams): Promise<StorageResult>;
  deleteImage(key: string): Promise<boolean>;
  getImageUrl(key: string): string;
}

export interface StorageMetadata {
  contentType?: string;
  contentLength?: number;
  etag?: string;
  lastModified?: Date;
  customMetadata?: Record<string, string>;
}

/**
 * Storage progress interface
 */
export interface StorageProgress {
  bytesTransferred: number;
  totalBytes: number;
  percent: number;
}

/**
 * Storage file interface
 */
export interface StorageFile {
  path: string;
  lastModified: Date;
  userId?: string;
  size?: number;
  metadata?: Record<string, string>;
}

/**
 * Image storage service interface
 */
export interface IImageStorageService {
  uploadFile(file: Buffer, userId: string, projectId: string, metadata?: Record<string, unknown>): Promise<StorageResult>;
  deleteFile(userId: string, projectId: string): Promise<void>;
  fileExists(userId: string, projectId: string): Promise<boolean>;
  downloadFile(userId: string, projectId: string): Promise<Buffer>;
  listFiles(directory: string): Promise<StorageFile[]>;
  getFileSize(path: string): Promise<number>;
}

export interface FallbackSyncResult {
  success: boolean;
  error?: Error;
  filesProcessed: number;
  failedFiles: string[];
}

export interface ImageUploadConfig {
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  endpoint?: string;
  maxRetries?: number;
}

export interface ImageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
  metadata?: ImageMetadata;
}

export interface ImageUploadProgress {
  bytesUploaded: number;
  totalBytes: number;
  percentage: number;
}

export interface ImageUploadOptions {
  metadata?: Record<string, string>;
  contentType?: string;
  acl?: string;
  onProgress?: (progress: ImageUploadProgress) => void;
}

export interface ImageStorageProvider {
  uploadImage(
    file: Buffer,
    key: string,
    options?: ImageUploadOptions
  ): Promise<ImageUploadResult>;
  
  deleteImage(key: string): Promise<boolean>;
  
  getImageUrl(key: string): string;
}

/**
 * Base upload response interface
 */
export interface BaseUploadResponse {
  success: boolean;
  error?: string;
}

/**
 * Upload status response
 */
export interface UploadStatusResponse {
  status: 'pending' | 'completed' | 'failed';
  imageUrl?: string;
  error?: string;
} 