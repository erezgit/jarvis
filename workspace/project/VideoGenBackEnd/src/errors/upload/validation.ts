import { UploadError } from './base';
import { ErrorCode } from '../../types/errors';

/**
 * Error class for upload validation failures
 */
export class UploadValidationError extends UploadError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(ErrorCode.UPLOAD_VALIDATION_FAILED, message, details);
    Object.setPrototypeOf(this, UploadValidationError.prototype);
  }
} 