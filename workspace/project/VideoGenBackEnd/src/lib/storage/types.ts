/**
 * Core storage types used across services
 */
import { BaseMetadata } from '../../types/metadata';

/**
 * Base file metadata interface
 * Extends BaseMetadata with file-specific properties
 */
export interface FileMetadata extends BaseMetadata {
  /**
   * Content type of the file (e.g., 'image/jpeg', 'video/mp4')
   */
  contentType: string;
  
  /**
   * MIME type of the file
   */
  mimeType: string;
  
  /**
   * Hash of the file content (for integrity verification)
   */
  hash?: string;
  
  /**
   * Last modified date of the file
   */
  lastModified?: Date;
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