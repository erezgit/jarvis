import { AllowedImageMimeType } from '../../services/image/storage/types';

/**
 * Storage bucket configuration
 */
export const BUCKET_CONFIG = {
  images: {
    name: 'images',
    public: true,
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'] as AllowedImageMimeType[],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp']
  },
  videos: {
    name: 'videos',
    public: true,
    maxSize: 100 * 1024 * 1024, // 100MB
    allowedTypes: ['video/mp4', 'video/webm'],
    allowedExtensions: ['.mp4', '.webm']
  }
} as const;

/**
 * Type for bucket names
 */
export type BucketName = keyof typeof BUCKET_CONFIG;

/**
 * Get bucket configuration by name
 */
export function getBucketConfig(bucket: BucketName) {
  return BUCKET_CONFIG[bucket];
} 