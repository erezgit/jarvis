import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';
import { UserRole } from '../types';
import { validateSession } from './session';
import { AppError } from '../errors/base';
import { authRequestLogger, sessionEventLogger, authErrorLogger } from './logging';
import { ErrorCode, ErrorSeverity, HttpStatus } from '../types/errors';
import { logger } from '../lib/server/logger';
import { createServerSupabase } from '../lib/supabase';
import { AuthError } from '../types/auth';

/**
 * Standard authentication middleware for all routes
 * This is the ONLY authentication middleware that should be used in the application
 * 
 * Usage:
 * ```typescript
 * router.post(
 *   '/endpoint',
 *   authenticateToken,
 *   checkQuota,
 *   handler
 * );
 * ```
 */
export const authenticateToken: RequestHandler<ParamsDictionary, any, any, ParsedQs> = async (req, res, next) => {
  logger.info('Starting authentication middleware', {
    path: req.path,
    method: req.method,
    hasAuthHeader: !!req.headers.authorization,
    timestamp: new Date().toISOString()
  });

  // Apply logging middleware first
  authRequestLogger(req, res, () => {
    sessionEventLogger(req, res, async () => {
      try {
        await validateSession(req, res, next);
      } catch (error) {
        logger.error('Authentication middleware error', {
          error,
          path: req.path,
          method: req.method,
          isError: error instanceof Error,
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          errorStack: error instanceof Error ? error.stack : undefined,
          timestamp: new Date().toISOString()
        });

        // Transform errors to AuthError if needed
        if (!(error instanceof AuthError)) {
          error = new AuthError(
            ErrorCode.AUTHENTICATION_FAILED,
            error instanceof Error ? error.message : 'Authentication failed'
          );
        }

        authErrorLogger(error, req, res, next);
      }
    });
  });
};

/**
 * Middleware to check if user has required role
 */
export const requireRole = (roles: UserRole[]): RequestHandler<ParamsDictionary, any, any, ParsedQs> => {
  return async (req, res, next) => {
    logger.info('Checking user role', {
      path: req.path,
      method: req.method,
      requiredRoles: roles,
      userRole: req.user?.role,
      timestamp: new Date().toISOString()
    });

    if (!req.user || !req.user.role) {
      const error = new AppError(
        HttpStatus.UNAUTHORIZED,
        ErrorCode.INVALID_CREDENTIALS,
        'Authentication required',
        ErrorSeverity.ERROR
      );
      logger.error('Role check failed - no user or role', {
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
      });
      authErrorLogger(error, req, res, next);
      return;
    }

    if (!roles.includes(req.user.role)) {
      const error = new AppError(
        HttpStatus.FORBIDDEN,
        ErrorCode.INVALID_CREDENTIALS,
        'Insufficient permissions',
        ErrorSeverity.ERROR
      );
      logger.error('Role check failed - insufficient permissions', {
        path: req.path,
        method: req.method,
        userRole: req.user.role,
        requiredRoles: roles,
        timestamp: new Date().toISOString()
      });
      authErrorLogger(error, req, res, next);
      return;
    }

    logger.info('Role check passed', {
      path: req.path,
      method: req.method,
      userRole: req.user.role,
      timestamp: new Date().toISOString()
    });
    next();
  };
};

/**
 * Higher-order function to protect routes with authentication
 */
export const protectedRoute = (handler: RequestHandler): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    logger.info('Starting protected route handler', {
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString()
    });

    // Apply logging middleware
    authRequestLogger(req, res, () => {
      sessionEventLogger(req, res, async () => {
        try {
          // First validate the session
          await validateSession(req, res, async (error?: any) => {
            if (error) {
              logger.error('Session validation failed in protected route', {
                error,
                path: req.path,
                method: req.method,
                isError: error instanceof Error,
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
                timestamp: new Date().toISOString()
              });
              authErrorLogger(error, req, res, next);
              return;
            }
            // If session is valid, execute the handler
            try {
              await handler(req, res, next);
            } catch (handlerError) {
              logger.error('Protected route handler error', {
                error: handlerError,
                path: req.path,
                method: req.method,
                isError: handlerError instanceof Error,
                errorMessage: handlerError instanceof Error ? handlerError.message : 'Unknown error',
                timestamp: new Date().toISOString()
              });
              authErrorLogger(handlerError, req, res, next);
            }
          });
        } catch (error) {
          logger.error('Protected route error', {
            error,
            path: req.path,
            method: req.method,
            isError: error instanceof Error,
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
          });
          authErrorLogger(error, req, res, next);
        }
      });
    });
  };
};

/**
 * Middleware to check user's file upload quota
 */
export const checkUploadQuota = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info('Checking upload quota', {
      path: req.path,
      method: req.method,
      userId: req.user?.id,
      timestamp: new Date().toISOString()
    });

    if (!req.user) {
      const error = new AppError(
        HttpStatus.UNAUTHORIZED,
        ErrorCode.INVALID_CREDENTIALS,
        'User not authenticated',
        ErrorSeverity.ERROR
      );
      logger.error('Upload quota check failed - no user', {
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
      });
      throw error;
    }

    const supabase = createServerSupabase();
    
    // Get user's current upload count for the last 24 hours
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - 24);
    
    const { count, error } = await supabase
      .from('projects')
      .select('*', { count: 'exact' })
      .eq('user_id', req.user.id)
      .gte('created_at', startDate.toISOString());

    if (error || count === null) {
      logger.error('Failed to check upload count', {
        error,
        userId: req.user.id,
        timestamp: new Date().toISOString()
      });
      throw new AppError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        ErrorCode.SERVER_ERROR,
        'Failed to check upload quota',
        ErrorSeverity.ERROR
      );
    }

    // Check against quota limit (100 uploads per 24 hours)
    const DAILY_UPLOAD_LIMIT = 100;
    if (count >= DAILY_UPLOAD_LIMIT) {
      logger.warn('Upload quota exceeded', {
        userId: req.user.id,
        count,
        limit: DAILY_UPLOAD_LIMIT,
        timestamp: new Date().toISOString()
      });
      throw new AppError(
        HttpStatus.FORBIDDEN,
        ErrorCode.UPLOAD_FAILED,
        'Daily upload quota exceeded',
        ErrorSeverity.WARNING
      );
    }

    logger.info('Upload quota check passed', {
      userId: req.user.id,
      currentCount: count,
      limit: DAILY_UPLOAD_LIMIT,
      timestamp: new Date().toISOString()
    });
    next();
  } catch (error) {
    logger.error('Upload quota check error', {
      error,
      path: req.path,
      method: req.method,
      userId: req.user?.id,
      isError: error instanceof Error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    next(error);
  }
}; 