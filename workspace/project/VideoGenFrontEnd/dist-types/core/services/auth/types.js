/**
 * Custom error class for authentication errors
 */
export class AuthError extends Error {
    constructor(message, code) {
        super(message);
        Object.defineProperty(this, "code", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: code
        });
        this.name = 'AuthError';
    }
}
/**
 * Helper function to convert a regular Error to an AuthError
 */
export const toAuthError = (error) => {
    if (error instanceof AuthError) {
        return error;
    }
    return new AuthError(error.message || 'Unknown authentication error', 'SERVICE_ERROR');
};
