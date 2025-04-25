/**
 * Enum defining all possible error codes in the application
 */
export enum ErrorCode {
  // Auth Errors
  INVALID_CREDENTIALS = 'auth/invalid-credentials',
  TOKEN_EXPIRED = 'auth/token-expired',
  AUTHENTICATION_FAILED = 'auth/authentication-failed',
  NO_SESSION = 'auth/no-session',
  REGISTRATION_FAILED = 'auth/registration-failed',
  PASSWORDS_DO_NOT_MATCH = 'auth/passwords-do-not-match',
  
  // Security Errors
  UNAUTHORIZED = 'security/unauthorized',
  FORBIDDEN = 'security/forbidden',
  
  // Validation Errors
  INVALID_INPUT = 'validation/invalid-input',
  VALIDATION_FAILED = 'validation/validation-failed',
  
  // Upload Errors
  UPLOAD_VALIDATION_FAILED = 'upload/validation-failed',
  UPLOAD_STORAGE_FAILED = 'upload/storage-failed',
  UPLOAD_FAILED = 'upload/upload-failed',
  UPLOAD_INTERRUPTED = 'upload/interrupted',
  UPLOAD_SIZE_LIMIT = 'upload/size-limit-exceeded',
  
  // Storage Errors
  STORAGE_ERROR = 'storage/error',
  
  // Video Generation Errors
  VIDEO_GENERATION_FAILED = 'video/generation-failed',
  VIDEO_PROCESSING_FAILED = 'video/processing-failed',
  VIDEO_STORAGE_FAILED = 'video/storage-failed',
  VIDEO_NOT_FOUND = 'video/not-found',
  VIDEO_VALIDATION_FAILED = 'video/validation-failed',
  INVALID_STATUS_TRANSITION = 'video/invalid-status-transition',
  
  // System Errors
  SERVER_ERROR = 'system/server-error',
  CONNECTION_ERROR = 'system/connection-error',
  NOT_FOUND = 'system/not-found',
  EXTERNAL_SERVICE_ERROR = 'system/external-service-error',
  
  // Runway Errors
  RUNWAY_GENERATION_FAILED = 'runway/generation-failed',
  RUNWAY_STATUS_CHECK_FAILED = 'runway/status-check-failed',
  INVALID_GENERATION_STATUS = 'runway/invalid-status',
  
  // Payment Errors
  PAYMENT_OPERATION_FAILED = 'payment/operation-failed',
  PAYMENT_NOT_FOUND = 'payment/not-found',
  PAYMENT_PROCESSING_FAILED = 'payment/processing-failed',
  INSUFFICIENT_FUNDS = 'payment/insufficient-funds',
  INVALID_PACKAGE = 'payment/invalid-package',
  
  // Token Errors
  TOKEN_OPERATION_FAILED = 'token/operation-failed',
  TOKEN_BALANCE_NOT_FOUND = 'token/balance-not-found',
  INSUFFICIENT_TOKENS = 'token/insufficient-tokens',
  
  // Service Errors
  SERVICE_INITIALIZATION_FAILED = 'service/initialization-failed',
  SERVICE_OPERATION_FAILED = 'service/operation-failed',
  SERVICE_VALIDATION_FAILED = 'service/validation-failed',
  SERVICE_DEPENDENCY_ERROR = 'service/dependency-error',
  
  // Repository Errors
  REPOSITORY_OPERATION_FAILED = 'repository/operation-failed',
  REPOSITORY_CONNECTION_ERROR = 'repository/connection-error',
  REPOSITORY_VALIDATION_ERROR = 'repository/validation-error'
}

/**
 * HTTP status codes
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500
}

/**
 * Error severity levels for logging
 */
export enum ErrorSeverity {
  HIGH = 'high',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
  LOW = 'low'
}

/**
 * Standard error response interface
 */
export interface ErrorResponse {
  code: ErrorCode;
  message: string;
  status: HttpStatus;
  severity: ErrorSeverity;
  details?: Record<string, unknown>;
}

/**
 * Type guard to check if an object is an ErrorResponse
 */
export function isErrorResponse(obj: unknown): obj is ErrorResponse {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'code' in obj &&
    'message' in obj &&
    'status' in obj &&
    'severity' in obj
  );
} 