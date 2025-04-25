import { ErrorCode, ErrorSeverity, HttpStatus, ErrorResponse } from '../types/errors';

/**
 * Base error class for all application errors
 * Provides consistent error structure and logging
 */
export class AppError extends Error {
  constructor(
    public readonly status: HttpStatus,
    public readonly code: ErrorCode,
    message: string,
    public readonly severity: ErrorSeverity,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }

  /**
   * Convert error to response format
   */
  toResponse(): ErrorResponse {
    return {
      code: this.code,
      message: this.message,
      status: this.status,
      severity: this.severity,
      details: this.details
    };
  }

  /**
   * Convert error to loggable format
   */
  toLog(): Record<string, unknown> {
    return {
      code: this.code,
      message: this.message,
      severity: this.severity,
      ...this.details,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Factory method to create an error from a response
   */
  static fromResponse(response: ErrorResponse): AppError {
    return new AppError(
      response.status as HttpStatus,
      response.code as ErrorCode,
      response.message,
      response.severity as ErrorSeverity,
      response.details
    );
  }

  /**
   * Create a validation error
   */
  static validation(message: string, details?: Record<string, unknown>): AppError {
    return new AppError(
      HttpStatus.BAD_REQUEST,
      ErrorCode.INVALID_INPUT,
      message,
      ErrorSeverity.WARNING,
      details
    );
  }

  /**
   * Create a server error
   */
  static server(message: string, details?: Record<string, unknown>): AppError {
    return new AppError(
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorCode.SERVER_ERROR,
      message,
      ErrorSeverity.ERROR,
      details
    );
  }
}

/**
 * Base security error class
 */
export class SecurityError extends AppError {
  constructor(
    code: ErrorCode = ErrorCode.UNAUTHORIZED,
    message: string = 'Unauthorized',
    details?: Record<string, unknown>
  ) {
    super(
      HttpStatus.UNAUTHORIZED,
      code,
      message,
      ErrorSeverity.ERROR,
      details
    );
    Object.setPrototypeOf(this, SecurityError.prototype);
  }
}

/**
 * Concrete security error classes
 */
export class TokenValidationError extends SecurityError {
  constructor(message: string = 'Token validation failed', details?: Record<string, unknown>) {
    super(ErrorCode.AUTHENTICATION_FAILED, message, details);
    Object.setPrototypeOf(this, TokenValidationError.prototype);
  }
}

export class TokenExpiredError extends SecurityError {
  constructor(message: string = 'Token has expired', details?: Record<string, unknown>) {
    super(ErrorCode.TOKEN_EXPIRED, message, details);
    Object.setPrototypeOf(this, TokenExpiredError.prototype);
  }
}

export class NoTokenError extends SecurityError {
  constructor(message: string = 'No token provided', details?: Record<string, unknown>) {
    super(ErrorCode.NO_SESSION, message, details);
    Object.setPrototypeOf(this, NoTokenError.prototype);
  }
}

export class InvalidTokenFormatError extends SecurityError {
  constructor(message: string = 'Invalid token format', details?: Record<string, unknown>) {
    super(ErrorCode.AUTHENTICATION_FAILED, message, details);
    Object.setPrototypeOf(this, InvalidTokenFormatError.prototype);
  }
}

/**
 * Base service error class
 */
export class ServiceError extends AppError {
  constructor(
    code: ErrorCode = ErrorCode.SERVICE_OPERATION_FAILED,
    message: string = 'Service operation failed',
    details?: Record<string, unknown>
  ) {
    super(
      HttpStatus.INTERNAL_SERVER_ERROR,
      code,
      message,
      ErrorSeverity.ERROR,
      details
    );
    Object.setPrototypeOf(this, ServiceError.prototype);
  }
}

/**
 * Service initialization error
 */
export class ServiceInitializationError extends ServiceError {
  constructor(message: string = 'Service initialization failed', details?: Record<string, unknown>) {
    super(ErrorCode.SERVICE_INITIALIZATION_FAILED, message, details);
    Object.setPrototypeOf(this, ServiceInitializationError.prototype);
  }
}

/**
 * Service validation error
 */
export class ServiceValidationError extends ServiceError {
  constructor(message: string = 'Service validation failed', details?: Record<string, unknown>) {
    super(ErrorCode.SERVICE_VALIDATION_FAILED, message, details);
    Object.setPrototypeOf(this, ServiceValidationError.prototype);
  }
}

/**
 * Repository error class
 */
export class RepositoryError extends AppError {
  constructor(
    code: ErrorCode = ErrorCode.REPOSITORY_OPERATION_FAILED,
    message: string = 'Repository operation failed',
    details?: Record<string, unknown>
  ) {
    super(
      HttpStatus.INTERNAL_SERVER_ERROR,
      code,
      message,
      ErrorSeverity.ERROR,
      details
    );
    Object.setPrototypeOf(this, RepositoryError.prototype);
  }
}

/**
 * Repository connection error
 */
export class RepositoryConnectionError extends RepositoryError {
  constructor(message: string = 'Repository connection failed', details?: Record<string, unknown>) {
    super(ErrorCode.REPOSITORY_CONNECTION_ERROR, message, details);
    Object.setPrototypeOf(this, RepositoryConnectionError.prototype);
  }
}

/**
 * Repository validation error
 */
export class RepositoryValidationError extends RepositoryError {
  constructor(message: string = 'Repository validation failed', details?: Record<string, unknown>) {
    super(ErrorCode.REPOSITORY_VALIDATION_ERROR, message, details);
    Object.setPrototypeOf(this, RepositoryValidationError.prototype);
  }
} 