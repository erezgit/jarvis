// Re-export all types from types.ts
export * from './types';

// Export validation functions and types
export {
  validateEmail,
  validatePassword,
  validateLoginCredentials,
  validateSignupCredentials,
} from './validation';
export type { ValidationResult } from './validation';

// Export type guards
export {
  isAuthUser,
  isAuthSession,
  isAuthError,
  isAuthResponse,
  isSuccessfulAuthResponse,
  isFailedAuthResponse,
} from './guards';

// Export mapper
export { AuthMapper } from './mapper';

// Export service interface and implementation
export { AuthService, authService } from './service';
