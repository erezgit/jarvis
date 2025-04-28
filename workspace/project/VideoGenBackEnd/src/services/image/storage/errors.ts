import { AppError } from '../../../errors/base';
import { ErrorCode, ErrorSeverity, HttpStatus } from '../../../types/errors';

/**
 * Base storage error
 */
export class StorageError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorCode.STORAGE_ERROR,
      message,
      ErrorSeverity.ERROR,
      details
    );
    Object.setPrototypeOf(this, StorageError.prototype);
  }
}

/**
 * Error for upload failures
 */
export class UploadError extends StorageError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(`Upload failed: ${message}`, details);
    Object.setPrototypeOf(this, UploadError.prototype);
  }
}

/**
 * Error for download failures
 */
export class DownloadError extends StorageError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(`Download failed: ${message}`, details);
    Object.setPrototypeOf(this, DownloadError.prototype);
  }
}

/**
 * Error for delete operations
 */
export class DeleteError extends StorageError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(`Delete failed: ${message}`, details);
    Object.setPrototypeOf(this, DeleteError.prototype);
  }
}

/**
 * Error for quota exceeded
 */
export class QuotaExceededError extends StorageError {
  constructor(details?: Record<string, unknown>) {
    super('Storage quota exceeded', details);
    Object.setPrototypeOf(this, QuotaExceededError.prototype);
  }
}

/**
 * Error for invalid file operations
 */
export class InvalidFileError extends StorageError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(`Invalid file operation: ${message}`, details);
    Object.setPrototypeOf(this, InvalidFileError.prototype);
  }
}

/**
 * Error for connection issues
 */
export class StorageConnectionError extends StorageError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(`Storage connection error: ${message}`, details);
    Object.setPrototypeOf(this, StorageConnectionError.prototype);
  }
}

/**
 * Error for timeout issues
 */
export class StorageTimeoutError extends StorageError {
  constructor(operation: string, timeout: number, details?: Record<string, unknown>) {
    super(`Storage operation '${operation}' timed out after ${timeout}ms`, details);
    Object.setPrototypeOf(this, StorageTimeoutError.prototype);
  }
}

/**
 * Error for permission issues
 */
export class StoragePermissionError extends StorageError {
  constructor(operation: string, details?: Record<string, unknown>) {
    super(`Permission denied for operation: ${operation}`, details);
    Object.setPrototypeOf(this, StoragePermissionError.prototype);
  }
} 