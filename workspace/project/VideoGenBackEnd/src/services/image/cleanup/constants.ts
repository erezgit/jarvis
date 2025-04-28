import { CleanupConfig } from './types';

// Default cleanup configuration
export const DEFAULT_CLEANUP_CONFIG: CleanupConfig = {
  // 24 hours for temporary files
  tempFileMaxAge: 24 * 60 * 60 * 1000,
  // 7 days for stale uploads
  staleUploadMaxAge: 7 * 24 * 60 * 60 * 1000,
  // 3 days for failed uploads
  failedUploadMaxAge: 3 * 24 * 60 * 60 * 1000,
  
  // Process up to 100 files per batch
  maxFilesPerBatch: 100,
  // Process up to 10 batches per cleanup run
  maxBatchesPerRun: 10,
  
  // Run cleanup every 12 hours
  cleanupInterval: 12 * 60 * 60 * 1000,
  
  // Default paths
  tempDirectory: 'temp',
  uploadsDirectory: 'uploads'
};

export const ERROR_MESSAGES = {
  CLEANUP_IN_PROGRESS: 'Cleanup is already in progress',
  INVALID_CONFIG: 'Invalid cleanup configuration',
  FILE_ACCESS_ERROR: 'Failed to access file system',
  DB_ACCESS_ERROR: 'Failed to access database',
  STORAGE_ACCESS_ERROR: 'Failed to access storage',
  SCHEDULE_ERROR: 'Failed to schedule cleanup',
}; 