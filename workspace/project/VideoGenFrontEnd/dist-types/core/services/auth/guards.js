/**
 * Type guard for AuthUser
 */
export function isAuthUser(value) {
    return (typeof value === 'object' &&
        value !== null &&
        'id' in value &&
        'email' in value &&
        typeof value.id === 'string' &&
        typeof value.email === 'string');
}
/**
 * Type guard for AuthSession
 */
export function isAuthSession(value) {
    return (typeof value === 'object' &&
        value !== null &&
        'accessToken' in value &&
        typeof value.accessToken === 'string' &&
        (!('user' in value) ||
            value.user === undefined ||
            isAuthUser(value.user)));
}
/**
 * Type guard for AuthError
 */
export function isAuthError(value) {
    return value instanceof Error && 'code' in value && typeof value.code === 'string';
}
/**
 * Type guard for AuthResponse
 */
export function isAuthResponse(value) {
    return (typeof value === 'object' &&
        value !== null &&
        'session' in value &&
        (value.session === null || isAuthSession(value.session)) &&
        (!('error' in value) ||
            value.error === undefined ||
            isAuthError(value.error)));
}
/**
 * Type guard for successful AuthResponse
 */
export function isSuccessfulAuthResponse(value) {
    return isAuthResponse(value) && value.session !== null && !value.error;
}
/**
 * Type guard for failed AuthResponse
 */
export function isFailedAuthResponse(value) {
    return isAuthResponse(value) && value.session === null && isAuthError(value.error);
}
