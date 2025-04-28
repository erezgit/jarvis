import { Request, Response, NextFunction } from 'express';
import { ProjectNotFoundError, ProjectAccessError, ProjectValidationError } from '../errors/project';
import { logger } from '../lib/server/logger';
import { VideoError, VideoGenerationError, VideoNotFoundError, VideoValidationError } from '../services/video/errors';
import { ErrorCode } from '../types/errors';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log all errors
  logger.error('[Error] Request failed', {
    path: req.path,
    method: req.method,
    error: error.message,
    errorType: error.constructor.name,
    userId: req.user?.id
  });

  // Handle known errors
  if (error instanceof ProjectNotFoundError) {
    return res.status(404).json({
      error: {
        code: 'project/not-found',
        message: error.message
      }
    });
  }

  if (error instanceof ProjectAccessError) {
    return res.status(403).json({
      error: {
        code: 'auth/insufficient-permissions',
        message: error.message
      }
    });
  }

  if (error instanceof ProjectValidationError) {
    return res.status(400).json({
      error: {
        code: 'project/validation-error',
        message: error.message
      }
    });
  }

  // Handle video errors
  if (error instanceof VideoError) {
    // Determine status code based on error type
    let statusCode = 500;
    let errorCode = 'video/error';
    
    // Map specific error types to HTTP status codes
    if (error instanceof VideoNotFoundError) {
      statusCode = 404;
      errorCode = 'video/not-found';
    } else if (error instanceof VideoValidationError) {
      statusCode = 400;
      errorCode = 'video/validation-error';
    } else if (error instanceof VideoGenerationError) {
      statusCode = 400;
      errorCode = 'video/generation-error';
    }
    
    // Check for specific error codes
    if ((error as VideoError).code === ErrorCode.INSUFFICIENT_TOKENS) {
      statusCode = 402; // Payment Required
      errorCode = 'token/insufficient-tokens';
    }
    
    return res.status(statusCode).json({
      error: {
        code: errorCode,
        message: error.message,
        details: (error as any).details // Include any details if available
      }
    });
  }

  // Handle unexpected errors
  return res.status(500).json({
    error: {
      code: 'server/internal-error',
      message: 'An unexpected error occurred'
    }
  });
}

/**
 * Middleware to handle 404 errors
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.warn('Resource not found', {
    path: req.path,
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString()
  });

  res.status(404).json({
    error: {
      code: 'route/not-found',
      message: 'The requested resource was not found'
    }
  });
}; 