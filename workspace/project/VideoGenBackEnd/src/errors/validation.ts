import { AppError } from './base';
import { ErrorCode, ErrorSeverity, HttpStatus } from '../types/errors';

/**
 * Validation specific error class
 */
export class ValidationError extends AppError {
  constructor(
    message: string,
    details?: Record<string, unknown>
  ) {
    super(
      HttpStatus.BAD_REQUEST,
      ErrorCode.INVALID_INPUT,
      message,
      ErrorSeverity.LOW,
      details
    );
    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  /**
   * Creates a validation error for missing required fields
   */
  static missingField(fieldName: string): ValidationError {
    return new ValidationError(
      `Missing required field: ${fieldName}`,
      { field: fieldName }
    );
  }

  /**
   * Creates a validation error for invalid field value
   */
  static invalidField(fieldName: string, reason: string): ValidationError {
    return new ValidationError(
      `Invalid value for field: ${fieldName}. ${reason}`,
      { field: fieldName, reason }
    );
  }
} 