import { AppError } from '../../../errors/base';
import { ErrorCode, ErrorSeverity, HttpStatus } from '../../../types/errors';

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(
      HttpStatus.BAD_REQUEST,
      ErrorCode.VALIDATION_FAILED,
      message,
      ErrorSeverity.WARNING,
      details
    );
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
} 