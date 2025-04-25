/**
 * API Error types and handling utilities
 */

export type ApiErrorCode =
  | 'AUTH_ERROR' // Authentication errors (401)
  | 'FORBIDDEN' // Authorization errors (403)
  | 'RATE_LIMIT' // Rate limiting (429)
  | 'SERVER_ERROR' // Server errors (500)
  | 'NETWORK_ERROR' // Network/connectivity issues
  | 'VALIDATION_ERROR' // Invalid input (400)
  | 'NOT_FOUND' // Resource not found (404)
  | 'REQUEST_FAILED'; // Generic request failure

export interface IApiError {
  code: ApiErrorCode;
  message: string;
  status?: number;
  retryAfter?: number;
}

export class ApiError extends Error implements IApiError {
  constructor(
    public code: ApiErrorCode,
    public message: string,
    public status?: number,
    public retryAfter?: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Maps HTTP status codes to API error codes
 */
export const mapHttpError = (status: number, message?: string): ApiError => {
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
