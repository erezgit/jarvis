import type { ServiceResult } from '@/core/types/service';

// Core types
/**
 * Represents an authenticated session with access and refresh tokens
 */
export interface AuthSession {
  /** JWT access token */
  accessToken: string;
  /** JWT refresh token for obtaining new access tokens */
  refreshToken?: string;
  /** Unix timestamp when the access token expires */
  expiresAt?: number;
  /** Authenticated user information */
  user?: AuthUser;
}

/**
 * Represents an authenticated user's basic information
 */
export interface AuthUser {
  /** Unique identifier for the user */
  id: string;
  /** User's email address */
  email: string;
  /** Optional display name for the user */
  name?: string;
}

/**
 * Credentials required for user login
 */
export interface LoginCredentials {
  /** User's email address */
  email: string;
  /** User's password */
  password: string;
}

/**
 * Credentials required for user signup, extends login credentials
 */
export interface SignupCredentials extends LoginCredentials {
  /** Optional display name for new user */
  name?: string;
  /** Username for the new user */
  username?: string;
}

/**
 * Standard response format for authentication operations
 */
export interface AuthResponse {
  /** Active session if authentication was successful */
  session: AuthSession | null;
  /** Error information if authentication failed */
  error?: AuthError;
}

/**
 * Service interface defining all authentication operations
 */
export interface IAuthService {
  /** Authenticates a user with email and password */
  login(credentials: LoginCredentials): Promise<ServiceResult<AuthSession>>;
  /** Creates a new user account */
  signup(credentials: SignupCredentials): Promise<ServiceResult<AuthSession>>;
  /** Ends the current user session */
  logout(): Promise<ServiceResult<void>>;
  /** Checks if there is an active authenticated session */
  checkAuth(): Promise<ServiceResult<boolean>>;
  /** Refreshes the current session using the refresh token */
  refreshSession(): Promise<ServiceResult<AuthSession>>;
  /** Alias for refreshSession to maintain backward compatibility */
  restoreSession(): Promise<ServiceResult<boolean>>;
  /** Cleans up the auth service instance */
  destroy(): Promise<ServiceResult<void>>;
}

/**
 * Possible error codes for authentication operations
 */
export type AuthErrorCode =
  /** Invalid email/password combination */
  | 'INVALID_CREDENTIALS'
  /** User account not found */
  | 'USER_NOT_FOUND'
  /** Current session has expired */
  | 'SESSION_EXPIRED'
  /** Generic service error */
  | 'SERVICE_ERROR';

/**
 * Custom error class for authentication errors
 */
export class AuthError extends Error {
  constructor(
    message: string,
    public code: AuthErrorCode,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Helper function to convert a regular Error to an AuthError
 */
export const toAuthError = (error: Error): AuthError => {
  if (error instanceof AuthError) {
    return error;
  }
  return new AuthError(error.message || 'Unknown authentication error', 'SERVICE_ERROR');
};
