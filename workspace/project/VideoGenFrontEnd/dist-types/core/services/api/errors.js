/**
 * API Error types and handling utilities
 */
export class ApiError extends Error {
    constructor(code, message, status, retryAfter) {
        super(message);
        Object.defineProperty(this, "code", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: code
        });
        Object.defineProperty(this, "message", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: message
        });
        Object.defineProperty(this, "status", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: status
        });
        Object.defineProperty(this, "retryAfter", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: retryAfter
        });
        this.name = 'ApiError';
    }
}
/**
 * Maps HTTP status codes to API error codes
 */
export const mapHttpError = (status, message) => {
    switch (status) {
        case 401:
            return new ApiError('AUTH_ERROR', message || 'Authentication required');
        case 403:
            return new ApiError('FORBIDDEN', message || 'Access denied');
        case 404:
            return new ApiError('NOT_FOUND', message || 'Resource not found');
        case 429:
            return new ApiError('RATE_LIMIT', message || 'Too many requests');
        case 400:
            return new ApiError('VALIDATION_ERROR', message || 'Invalid request');
        default:
            return status >= 500
                ? new ApiError('SERVER_ERROR', message || 'Server error')
                : new ApiError('REQUEST_FAILED', message || 'Request failed');
    }
};
