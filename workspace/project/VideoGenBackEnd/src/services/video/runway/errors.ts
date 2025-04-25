import { AppError } from '../../../errors/base';
import { ErrorCode, ErrorSeverity, HttpStatus } from '../errors';

export class RunwayGenerationError extends AppError {
  constructor(code: string, message: string) {
    super(
      HttpStatus.INTERNAL_SERVER_ERROR,
      code as ErrorCode,
      message,
      ErrorSeverity.ERROR
    );
    Object.setPrototypeOf(this, RunwayGenerationError.prototype);
  }
}

export class RunwayStatusError extends AppError {
  constructor(code: string, message: string) {
    super(
      HttpStatus.INTERNAL_SERVER_ERROR,
      code as ErrorCode,
      message,
      ErrorSeverity.ERROR
    );
    Object.setPrototypeOf(this, RunwayStatusError.prototype);
  }
} 