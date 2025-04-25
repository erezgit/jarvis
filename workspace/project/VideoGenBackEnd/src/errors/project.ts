import { AppError } from './base';
import { ErrorCode, ErrorSeverity, HttpStatus } from '../types/errors';

export class ProjectError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorCode.SERVER_ERROR,
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
      { 
        code: ErrorCode.NOT_FOUND,
        projectId 
      }
    );
    Object.setPrototypeOf(this, ProjectNotFoundError.prototype);
  }
}

export class ProjectAccessError extends ProjectError {
  constructor(projectId: string, userId: string) {
    super(
      'Not authorized to access this project',
      {
        code: ErrorCode.UNAUTHORIZED,
        projectId,
        userId
      }
    );
    Object.setPrototypeOf(this, ProjectAccessError.prototype);
  }
}

export class ProjectValidationError extends ProjectError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(
      message,
      {
        ...details,
        code: ErrorCode.VALIDATION_FAILED
      }
    );
    Object.setPrototypeOf(this, ProjectValidationError.prototype);
  }
} 