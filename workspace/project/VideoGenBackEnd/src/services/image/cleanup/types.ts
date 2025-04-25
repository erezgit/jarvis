import { ServiceResult } from '../../../types';

export interface CleanupConfig {
  // Time thresholds
  tempFileMaxAge: number; // in milliseconds
  staleUploadMaxAge: number; // in milliseconds
  failedUploadMaxAge: number; // in milliseconds
  
  // Batch sizes
  maxFilesPerBatch: number;
  maxBatchesPerRun: number;
  
  // Intervals
  cleanupInterval: number; // in milliseconds
  
  // Paths
  tempDirectory: string;
  uploadsDirectory: string;
}

export interface CleanupStats {
  tempFilesRemoved: number;
  staleUploadsRemoved: number;
  failedUploadsRemoved: number;
  totalBytesRecovered: number;
  startTime: Date;
  endTime: Date;
  errors: Error[];
}

export interface CleanupResult extends ServiceResult<CleanupStats> {}

export interface ICleanupService {
  cleanup(): Promise<CleanupResult>;
  cleanupTempFiles(): Promise<CleanupResult>;
  cleanupStaleUploads(): Promise<CleanupResult>;
  cleanupFailedUploads(): Promise<CleanupResult>;
  startScheduledCleanup(): void;
  stopScheduledCleanup(): void;
} 