// Re-export everything from the auth directory
// This file serves as a bridge between the old implementation and the new standardized one
// Re-export all types
export * from './auth/types';
// Export validation functions and types
export * from './auth/validation';
// Export type guards
export * from './auth/guards';
// Export mapper
export { AuthMapper } from './auth/mapper';
// Export service interface and implementation
export { AuthService, authService } from './auth/service';
// Legacy code below - will be deprecated
// import { api, isApiError } from '@/lib/api';
// import { tokenService } from './token';
// import type { AuthResponseData, SignupCredentials, LoginCredentials, User } from '@/types/auth';
// ... rest of the legacy code ...
