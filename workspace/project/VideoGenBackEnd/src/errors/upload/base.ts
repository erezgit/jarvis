import { AppError } from '../base';
import { ErrorCode, HttpStatus, ErrorSeverity } from '../../types/errors';

/**
 * Base error class for all upload-related errors
 */
export class UploadError extends AppError {
  constructor(
    code: ErrorCode,
    message: string,
    details?: Record<string, unknown>
  ) {
    super(
      HttpStatus.BAD_REQUEST,
      code,
      message,
      ErrorSeverity.ERROR,
      details
    );
    Object.setPrototypeOf(this, UploadError.prototype);
  }
} 