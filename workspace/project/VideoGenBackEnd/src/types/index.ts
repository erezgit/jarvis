/**
 * Core type definitions for the application.
 * This file contains common types used across multiple services.
 */

// Common types will be defined here
import { AppUser, UserRole, AuthErrorCode } from './auth';
import { LoginRequest, RegisterRequest, PasswordResetRequest, UpdatePasswordRequest, AuthSession, AuthResponse } from '../services/auth/types';

// Re-export auth types
export { AppUser, UserRole, AuthErrorCode };
export { LoginRequest, RegisterRequest, PasswordResetRequest, UpdatePasswordRequest, AuthSession, AuthResponse };

/**
 * Global Error Types
 */
export interface ErrorResponse {
  /** Error code for categorizing the error */
  code: string;
  /** Human-readable error message */
  message: string;
  /** Optional additional error details */
  details?: Record<string, unknown>;
}

/**
 * Global API Response Types
 */
export interface ApiResponse<T = void> {
  /** Whether the API call was successful */
  success: boolean;
  /** Optional data returned by the API */
  data?: T;
  /** Error information if the API call failed */
  error?: ErrorResponse;
}

/**
 * Global Service Types
 */
export interface ServiceResult<T = void> {
  /** Whether the operation was successful */
  success: boolean;
  /** Optional data returned by the operation */
  data?: T;
  /** Error information if the operation failed */
  error?: Error;
}

/**
 * Global Configuration Types
 */
export interface AppConfig {
  /** Base URL for API endpoints */
  apiUrl: string;
  /** Current environment (development, staging, production) */
  environment: string;
  /** Application version */
  version: string;
  /** Authentication configuration */
  auth: {
    /** Key used for storing auth token */
    tokenKey: string;
    /** Number of days before token expires */
    expiryDays: number;
  };
}

/**
 * Standard database operation result
 * Used as the return type for all repository methods
 * @template T - The type of data returned by the database operation
 */
export interface DbResult<T = void> {
  /** The data returned by the operation, null if operation failed */
  data: T | null;
  /** Error information if the operation failed, null if successful */
  error: Error | null;
}

/**
 * Standard validation result format
 * Used across all validation operations
 */
export interface ValidationResult {
  /** Whether the validation passed */
  isValid: boolean;
  /** Array of validation error messages */
  errors?: string[];
  /** Optional metadata about the validation */
  metadata?: Record<string, unknown>;
}

// Express type extensions
declare global {
  namespace Express {
    interface Request {
      /** Authenticated user information */
      user?: AppUser;
    }
  }
}

// Export all common types
export * from './errors';
export * from './metadata';
export * from './validation';

export {};