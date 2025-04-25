import { ErrorCode, ErrorSeverity, HttpStatus } from './errors';
import { AppError } from '../errors/base';

/**
 * User roles enum
 */
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

/**
 * Core application user interface for authentication and session
 */
export interface AppUser {
  id: string;
  email: string;
  role: UserRole;
}

/**
 * Extended user interface with additional metadata
 */
export interface DbUser extends AppUser {
  created_at: string;
  // Add any other user metadata fields here
}

/**
 * Auth error codes
 */
export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'auth/invalid-credentials',
  TOKEN_EXPIRED = 'auth/token-expired',
  AUTHENTICATION_FAILED = 'auth/authentication-failed',
  NO_SESSION = 'auth/no-session',
  REGISTRATION_FAILED = 'auth/registration-failed',
  PASSWORDS_DO_NOT_MATCH = 'auth/passwords-do-not-match',
  INVALID_TOKEN = 'auth/invalid-token'
}

/**
 * Auth error class
 */
export class AuthError extends AppError {
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
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}

/**
 * Session error class
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
 * Auth request types
 */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends LoginRequest {
  confirmPassword: string;
}

export interface PasswordResetRequest {
  email: string;
}

/**
 * Auth response types
 */
export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface AuthResponse {
  user: AppUser | null;
  session?: AuthSession | null;
  message?: string;
} 