/**
 * Core storage types used across services
 */

/**
 * Base file metadata interface
 */
export interface FileMetadata {
  contentType: string;
  size: number;
  hash?: string;
  lastModified?: Date;
  [key: string]: unknown;
}

/**
 * Storage configuration interface
 */
export interface StorageConfig {
  bucket: string;
  path: string;
  contentType: string;
  metadata?: Record<string, unknown>;
}

/**
 * Storage operation result
 */
export interface StorageResult {
  url: string;
  path: string;
  bucket: string;
  metadata?: Record<string, unknown>;
}

/**
 * Upload file parameters
 */
export interface UploadFileParams {
  file: Buffer | Uint8Array;
  fileName: string;
  contentType: string;
  userId: string;
  projectId: string;
  metadata?: Record<string, unknown>;
}

/**
 * Upload response interface
 */
export interface UploadResponse {
  success: boolean;
  url?: string;
  error?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Upload progress interface
 */
export interface UploadProgress {
  bytesUploaded: number;
  totalBytes: number;
  percentage: number;
}

/**
 * Storage service interface
 */
export interface IStorageService {
  uploadFile(params: UploadFileParams): Promise<StorageResult>;
  deleteFile(bucket: string, path: string): Promise<void>;
  getFileUrl(bucket: string, path: string): Promise<string>;
  verifyFileExists(url: string): Promise<boolean>;
} 