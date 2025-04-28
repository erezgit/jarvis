import { AppError } from '../../errors/base';
import { ErrorCode, ErrorSeverity, HttpStatus } from '../../types/errors';

/**
 * Base class for Discovery service errors
 */
export class DiscoveryError extends AppError {
  constructor(
    message: string,
    details?: Record<string, unknown>
  ) {
    super(
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorCode.SERVICE_OPERATION_FAILED,
      message,
      ErrorSeverity.ERROR,
      details
    );
    Object.setPrototypeOf(this, DiscoveryError.prototype);
  }
}

/**
 * Error thrown when a discovery item is not found
 */
export class DiscoveryNotFoundError extends DiscoveryError {
  constructor(id: string) {
    super(
      `Discovery item not found: ${id}`,
      { id }
    );
    Object.setPrototypeOf(this, DiscoveryNotFoundError.prototype);
  }
}

/**
 * Error thrown when a video generation is not found
 */
export class GenerationNotFoundError extends DiscoveryError {
  constructor(id: string) {
    super(
      `Video generation not found: ${id}`,
      { id }
    );
    Object.setPrototypeOf(this, GenerationNotFoundError.prototype);
  }
}

/**
 * Error thrown when a video is already in the discovery list
 */
export class DuplicateDiscoveryError extends DiscoveryError {
  constructor(generationId: string) {
    super(
      `Video is already in the discovery list: ${generationId}`,
      { generationId }
    );
    Object.setPrototypeOf(this, DuplicateDiscoveryError.prototype);
  }
}

/**
 * Error thrown when there's an issue with the discovery order
 */
export class DiscoveryOrderError extends DiscoveryError {
  constructor(message: string, metadata?: Record<string, unknown>) {
    super(message, metadata);
    Object.setPrototypeOf(this, DiscoveryOrderError.prototype);
  }
}

/**
 * Error thrown when a user doesn't have permission to manage discoveries
 */
export class DiscoveryPermissionError extends DiscoveryError {
  constructor(userId: string) {
    super(
      `User does not have permission to manage discoveries: ${userId}`,
      { userId }
    );
    Object.setPrototypeOf(this, DiscoveryPermissionError.prototype);
  }
} 