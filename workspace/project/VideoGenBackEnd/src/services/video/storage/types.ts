import { BucketName } from '../../../config/storage/buckets';
import { StorageConfig as CoreStorageConfig, StorageResult as CoreStorageResult, UploadFileParams as CoreUploadFileParams } from '../../core/storage/types';
import { VideoMetadata } from '../types';

/**
 * Video storage configuration
 */
export interface StorageConfig extends CoreStorageConfig {
  bucket: BucketName;
  maxRetries?: number;
  timeout?: number;
}

/**
 * Video storage result
 */
export interface StorageResult extends CoreStorageResult {
  thumbnailUrl?: string;
  metadata: VideoMetadata;
}

/**
 * Video upload parameters
 */
export interface UploadFileParams extends CoreUploadFileParams {
  duration?: number;
  dimensions?: {
    width: number;
    height: number;
  };
}

/**
 * Video storage provider interface
 */
export interface IVideoStorageProvider {
  uploadVideo(params: UploadFileParams): Promise<StorageResult>;
  deleteVideo(key: string): Promise<boolean>;
  getVideoUrl(key: string): string;
} 