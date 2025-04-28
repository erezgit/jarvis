export enum ErrorCode {
  VIDEO_GENERATION_FAILED = 'video_generation_failed',
  RUNWAY_GENERATION_FAILED = 'runway_generation_failed',
  RUNWAY_STATUS_CHECK_FAILED = 'runway_status_check_failed',
  INVALID_GENERATION_STATUS = 'invalid_generation_status',
  INVALID_STATUS_TRANSITION = 'invalid_status_transition',
  DOWNLOAD_FAILED = 'download_failed',
  UPLOAD_FAILED = 'upload_failed',
  CLEANUP_FAILED = 'cleanup_failed',
  VALIDATION_FAILED = 'validation_failed',
  STORAGE_ERROR = 'storage_error',
  SERVER_ERROR = 'server_error',
  NOT_FOUND = 'not_found',
  UNAUTHORIZED = 'unauthorized',
  BAD_REQUEST = 'bad_request'
}

export enum ErrorSeverity {
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
} 