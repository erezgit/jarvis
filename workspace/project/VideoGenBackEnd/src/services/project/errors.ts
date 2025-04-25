import { AppError } from '../../errors/base';
import { ErrorCode, ErrorSeverity, HttpStatus } from '../../types/errors';

// Will implement specific error types in later phases 

/**
 * Video access error
 */
export class VideoAccessError extends AppError {
  constructor(projectId: string, userId: string) {
    super(
      HttpStatus.FORBIDDEN,
      ErrorCode.FORBIDDEN,
      `Access denied to videos for project ${projectId}`,
      ErrorSeverity.ERROR,
      { projectId, userId }
    );
    Object.setPrototypeOf(this, VideoAccessError.prototype);
  }
}

export class ProjectError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorCode.SERVICE_OPERATION_FAILED,
      message,
      ErrorSeverity.ERROR,
      details
    );
    Object.setPrototypeOf(this, ProjectError.prototype);
  }
}

export class ProjectNotFoundError extends ProjectError {
  constructor(projectId: string) {
    super(
      `Project not found: ${projectId}`,
      { projectId }
    );
    Object.setPrototypeOf(this, ProjectNotFoundError.prototype);
  }
}

export class ProjectAccessError extends ProjectError {
  constructor(projectId: string, userId: string) {
    super(
      `User ${userId} does not have access to project ${projectId}`,
      { projectId, userId }
    );
    Object.setPrototypeOf(this, ProjectAccessError.prototype);
  }
}

export class ProjectValidationError extends ProjectError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(
      message,
      details
    );
    Object.setPrototypeOf(this, ProjectValidationError.prototype);
  }
}

export class ProjectVideosNotFoundError extends ProjectError {
  constructor(projectId: string) {
    super(
      `No videos found for project: ${projectId}`,
      { projectId }
    );
    Object.setPrototypeOf(this, ProjectVideosNotFoundError.prototype);
  }
} 