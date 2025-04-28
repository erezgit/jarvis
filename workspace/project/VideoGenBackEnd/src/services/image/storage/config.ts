import { StorageConfig } from './types';

export const STORAGE_CONFIG: StorageConfig = {
  buckets: {
    primary: 'images',
    temp: 'temp'
  },
  retryConfig: {
    maxRetries: 3,
    initialDelayMs: 1000,
    maxDelayMs: 5000,
    backoffFactor: 2
  }
};

export const STORAGE_PATHS = {
  projectImage: (userId: string, projectId: string, filename: string = 'image') => 
    `${userId}/${projectId}/${filename}`
};

export const STORAGE_ERRORS = {
  UPLOAD_FAILED: 'storage/upload-failed',
  DELETE_FAILED: 'storage/delete-failed',
  NOT_FOUND: 'storage/not-found',
  INVALID_FILE: 'storage/invalid-file',
  QUOTA_EXCEEDED: 'storage/quota-exceeded'
} as const; 