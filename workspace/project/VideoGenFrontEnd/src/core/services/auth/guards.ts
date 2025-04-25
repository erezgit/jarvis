import type { AuthSession, AuthUser, AuthResponse, AuthError } from './types';

/**
 * Type guard for AuthUser
 */
export function isAuthUser(value: unknown): value is AuthUser {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'email' in value &&
    typeof (value as AuthUser).id === 'string' &&
    typeof (value as AuthUser).email === 'string'
  );
}

/**
 * Type guard for AuthSession
 */
export function isAuthSession(value: unknown): value is AuthSession {
  return (
    typeof value === 'object' &&
    value !== null &&
    'accessToken' in value &&
    typeof (value as AuthSession).accessToken === 'string' &&
    (!('user' in value) ||
      (value as AuthSession).user === undefined ||
      isAuthUser((value as AuthSession).user))
  );
}

/**
 * Type guard for AuthError
 */
export function isAuthError(value: unknown): value is AuthError {
  return value instanceof Error && 'code' in value && typeof (value as AuthError).code === 'string';
}

/**
 * Type guard for AuthResponse
 */
export function isAuthResponse(value: unknown): value is AuthResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'session' in value &&
    ((value as AuthResponse).session === null || isAuthSession((value as AuthResponse).session)) &&
    (!('error' in value) ||
      (value as AuthResponse).error === undefined ||
      isAuthError((value as AuthResponse).error))
  );
}

/**
 * Type guard for successful AuthResponse
 */
export function isSuccessfulAuthResponse(
  value: unknown,
): value is AuthResponse & { session: AuthSession } {
  return isAuthResponse(value) && value.session !== null && !value.error;
}

/**
 * Type guard for failed AuthResponse
 */
export function isFailedAuthResponse(value: unknown): value is AuthResponse & { error: AuthError } {
  return isAuthResponse(value) && value.session === null && isAuthError(value.error);
}
