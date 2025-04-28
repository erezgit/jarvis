import { AppError } from './base';
import { ErrorCode, ErrorSeverity, HttpStatus } from '../types/errors';

/**
 * Authentication specific error class
 */
export class AuthenticationError extends AppError {
  constructor(
    code: ErrorCode,
    message: string,
    details?: Record<string, unknown>
  ) {
    super(
      HttpStatus.UNAUTHORIZED,
      code,
      message,
      ErrorSeverity.ERROR,
      details
    );
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Session specific error class
 */
export class SessionError extends AppError {
  constructor(
    message: string,
    details?: Record<string, unknown>
  ) {
    super(
      HttpStatus.UNAUTHORIZED,
      ErrorCode.NO_SESSION,
      message,
      ErrorSeverity.ERROR,
      details
    );
    Object.setPrototypeOf(this, SessionError.prototype);
  }
}

/**
 * Utility function to map Supabase auth errors to our error format
 */
export function mapSupabaseAuthError(error: Error): AuthenticationError {
  // Common Supabase error messages and their mappings
  const errorMap: Record<string, { code: ErrorCode; message: string }> = {
    'Invalid login credentials': {
      code: ErrorCode.INVALID_CREDENTIALS,
      message: 'Invalid email or password'
    },
    'Email not confirmed': {
      code: ErrorCode.INVALID_CREDENTIALS,
      message: 'Please verify your email before logging in'
    },
    'Token expired': {
      code: ErrorCode.TOKEN_EXPIRED,
      message: 'Your session has expired, please log in again'
    }
  };

  const mapping = errorMap[error.message] || {
    code: ErrorCode.AUTHENTICATION_FAILED,
    message: 'Authentication failed'
  };

  return new AuthenticationError(mapping.code, mapping.message, {
    originalError: error.message
  });
} 