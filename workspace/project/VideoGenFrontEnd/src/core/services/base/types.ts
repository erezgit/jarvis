export interface ServiceResponse<T> {
  status: 'success' | 'error';
  data?: T;
  error?: {
    code: ServiceErrorCode;
    message: string;
  };
}

/**
 * Possible error codes for service operations
 */
export type ServiceErrorCode =
  | 'REQUEST_FAILED'
  | 'UNAUTHORIZED'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'SERVER_ERROR'
  | 'NETWORK_ERROR';

export interface ServiceOptions {
  retryAttempts?: number;
  timeout?: number;
}
