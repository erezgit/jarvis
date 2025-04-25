import { UploadError } from './base';
import { ErrorCode } from '../../types/errors';

/**
 * Error class for upload storage failures
 */
export class UploadStorageError extends UploadError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(ErrorCode.UPLOAD_STORAGE_FAILED, message, details);
    Object.setPrototypeOf(this, UploadStorageError.prototype);
  }
} 