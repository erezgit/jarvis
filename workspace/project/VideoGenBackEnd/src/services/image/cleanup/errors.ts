import { AppError } from '../../../errors/base';
import { ErrorCode, ErrorSeverity, HttpStatus } from '../../../types/errors';

/**
 * Base cleanup error
 */
export class CleanupError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorCode.SERVICE_OPERATION_FAILED,
      message,
      ErrorSeverity.ERROR,
      details
    );
    Object.setPrototypeOf(this, CleanupError.prototype);
  }
}

/**
 * Error when cleanup is already running
 */
export class CleanupInProgressError extends CleanupError {
  constructor(details?: Record<string, unknown>) {
    super('Cleanup operation already in progress', details);
    Object.setPrototypeOf(this, CleanupInProgressError.prototype);
  }
}

/**
 * Error for invalid cleanup configuration
 */
export class InvalidCleanupConfigError extends CleanupError {
  constructor(details?: Record<string, unknown>) {
    super('Invalid cleanup configuration', details);
    Object.setPrototypeOf(this, InvalidCleanupConfigError.prototype);
  }
}

/**
 * Error for file system operations
 */
export class FileSystemError extends CleanupError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(`File system error: ${message}`, details);
    Object.setPrototypeOf(this, FileSystemError.prototype);
  }
}

/**
 * Error for storage operations
 */
export class StorageError extends CleanupError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(`Storage error: ${message}`, details);
    Object.setPrototypeOf(this, StorageError.prototype);
  }
}

/**
 * Error for database operations
 */
export class DatabaseError extends CleanupError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(`Database error: ${message}`, details);
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }
} 