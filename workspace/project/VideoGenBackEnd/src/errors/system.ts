import { AppError } from './base';
import { ErrorCode, ErrorSeverity, HttpStatus } from '../types/errors';

/**
 * System level error class
 */
export class SystemError extends AppError {
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.SERVER_ERROR,
    details?: Record<string, unknown>
  ) {
    super(
      HttpStatus.INTERNAL_SERVER_ERROR,
      code,
      message,
      ErrorSeverity.HIGH,
      details
    );
    Object.setPrototypeOf(this, SystemError.prototype);
  }

  /**
   * Creates an error for external service failures
   */
  static externalServiceError(
    service: string,
    error: Error
  ): SystemError {
    return new SystemError(
      `External service error: ${service}`,
      ErrorCode.EXTERNAL_SERVICE_ERROR,
      {
        service,
        originalError: error.message,
        stack: error.stack
      }
    );
  }

  /**
   * Creates an error for connection failures
   */
  static connectionError(
    service: string,
    error: Error
  ): SystemError {
    return new SystemError(
      `Connection error: ${service}`,
      ErrorCode.CONNECTION_ERROR,
      {
        service,
        originalError: error.message,
        stack: error.stack
      }
    );
  }
} 