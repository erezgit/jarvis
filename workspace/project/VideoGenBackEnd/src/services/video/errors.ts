import { AppError } from '../../errors/base';
import { ErrorCode, ErrorSeverity, HttpStatus } from '../../types/errors';
import { GenerationStatus } from './types';

// Re-export error enums
export { ErrorCode, ErrorSeverity, HttpStatus };

/**
 * Base video error class
 */
export class VideoError extends AppError {
  constructor(
    code: ErrorCode = ErrorCode.VIDEO_GENERATION_FAILED,
    message: string,
    details?: Record<string, unknown>
  ) {
    super(
      HttpStatus.INTERNAL_SERVER_ERROR,
      code,
      message,
      ErrorSeverity.ERROR,
      details
    );
    Object.setPrototypeOf(this, VideoError.prototype);
  }
}

/**
 * Generation errors
 */
export class VideoGenerationError extends VideoError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(ErrorCode.VIDEO_GENERATION_FAILED, message, details);
    Object.setPrototypeOf(this, VideoGenerationError.prototype);
  }
}

/**
 * Processing errors
 */
export class VideoProcessingError extends VideoError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(ErrorCode.VIDEO_PROCESSING_FAILED, message, details);
    Object.setPrototypeOf(this, VideoProcessingError.prototype);
  }
}

/**
 * Validation errors
 */
export class VideoValidationError extends VideoError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(ErrorCode.VIDEO_VALIDATION_FAILED, message, details);
    Object.setPrototypeOf(this, VideoValidationError.prototype);
  }
}

/**
 * State transition errors
 */
export class InvalidStatusTransitionError extends VideoError {
  constructor(fromStatus: GenerationStatus, toStatus: GenerationStatus) {
    super(
      ErrorCode.INVALID_STATUS_TRANSITION,
      `Invalid status transition from ${fromStatus} to ${toStatus}`,
      { fromStatus, toStatus }
    );
    Object.setPrototypeOf(this, InvalidStatusTransitionError.prototype);
  }
}

/**
 * Not found errors
 */
export class VideoNotFoundError extends VideoError {
  constructor(generationId: string) {
    super(
      ErrorCode.VIDEO_NOT_FOUND,
      `Video generation not found: ${generationId}`,
      { generationId }
    );
    Object.setPrototypeOf(this, VideoNotFoundError.prototype);
  }
}

/**
 * Access errors
 */
export class VideoAccessError extends VideoError {
  constructor(generationId: string, userId: string) {
    super(
      ErrorCode.FORBIDDEN,
      `Access denied to video generation ${generationId}`,
      { generationId, userId }
    );
    Object.setPrototypeOf(this, VideoAccessError.prototype);
  }
}

/**
 * Error utilities
 */
export function isVideoError(error: unknown): error is VideoError {
  return error instanceof VideoError;
}

export function wrapVideoError(error: unknown, message: string): VideoError {
  if (isVideoError(error)) {
    return error;
  }
  return new VideoError(
    ErrorCode.VIDEO_GENERATION_FAILED,
    message,
    { originalError: error instanceof Error ? error.message : 'Unknown error' }
  );
}

/**
 * Project-related video errors
 */
export class VideoProjectNotFoundError extends VideoError {
  constructor(projectId: string) {
    super(
      ErrorCode.NOT_FOUND,
      `Project not found: ${projectId}`,
      { projectId }
    );
    Object.setPrototypeOf(this, VideoProjectNotFoundError.prototype);
  }
}

export class VideoProjectAccessError extends VideoError {
  constructor(projectId: string, userId: string) {
    super(
      ErrorCode.FORBIDDEN,
      `Access denied to project ${projectId}`,
      { projectId, userId }
    );
    Object.setPrototypeOf(this, VideoProjectAccessError.prototype);
  }
}

/**
 * Source image errors
 */
export class VideoSourceImageMissingError extends VideoError {
  constructor(projectId: string) {
    super(
      ErrorCode.VIDEO_VALIDATION_FAILED,
      `Source image missing for project: ${projectId}`,
      { projectId }
    );
    Object.setPrototypeOf(this, VideoSourceImageMissingError.prototype);
  }
}

/**
 * Authentication specific errors
 */
export class VideoAuthError extends VideoGenerationError {
  constructor(message: string = 'Authentication failed', details?: Record<string, unknown>) {
    super(message, {
      code: ErrorCode.UNAUTHORIZED,
      ...details
    });
    Object.setPrototypeOf(this, VideoAuthError.prototype);
  }
}

/**
 * Storage errors
 */
export class VideoStorageError extends VideoError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(ErrorCode.VIDEO_STORAGE_FAILED, message, details);
    Object.setPrototypeOf(this, VideoStorageError.prototype);
  }
}

/**
 * Metadata extraction errors
 */
export class MetadataExtractionError extends VideoError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(ErrorCode.VIDEO_PROCESSING_FAILED, message, details);
    Object.setPrototypeOf(this, MetadataExtractionError.prototype);
  }
} 