import { UploadedFile } from 'express-fileupload';
import { BucketName } from '../../config/storage/buckets';

/**
 * Base upload request interface
 */
export interface BaseUploadRequest {
  file: UploadedFile;
  userId: string;
}

/**
 * Image upload request interface
 */
export interface ImageUploadRequest extends BaseUploadRequest {
  projectId?: string;
  bucket?: BucketName;
}

/**
 * Profile image upload request
 */
export interface ProfileImageUploadRequest extends BaseUploadRequest {
  bucket: 'images';
} 