import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types';
import { logger } from '../lib/server/logger';
import { AppError } from '../errors/base';
import { ErrorCode, ErrorSeverity, HttpStatus } from '../types/errors';
import { createServerSupabase } from '../lib/supabase';

/**
 * Validate session and attach user to request
 */
export async function validateSession(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    logger.info('Starting session validation', {
      path: req.path,
      method: req.method,
      headers: {
        hasAuth: !!req.headers.authorization,
        authType: req.headers.authorization?.split(' ')[0],
      },
      timestamp: new Date().toISOString()
    });

    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      logger.error('Invalid authorization header', {
        path: req.path,
        method: req.method,
        hasHeader: !!authHeader,
        headerStart: authHeader?.substring(0, 10),
        timestamp: new Date().toISOString()
      });
      throw new AppError(
        HttpStatus.UNAUTHORIZED,
        ErrorCode.INVALID_CREDENTIALS,
        'Invalid authorization header format',
        ErrorSeverity.ERROR
      );
    }

    const token = authHeader.split(' ')[1];
    logger.info('Token extracted', {
      path: req.path,
      method: req.method,
      hasToken: !!token,
      tokenLength: token?.length,
      timestamp: new Date().toISOString()
    });
    
    // Validate user with Supabase
    const supabase = createServerSupabase();
    logger.info('Supabase client created for session validation', {
      path: req.path,
      method: req.method,
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      timestamp: new Date().toISOString()
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError) {
      logger.error('Supabase getUser error', {
        error: userError,
        path: req.path,
        method: req.method,
        errorMessage: userError.message,
        timestamp: new Date().toISOString()
      });
      throw new AppError(
        HttpStatus.UNAUTHORIZED,
        ErrorCode.INVALID_CREDENTIALS,
        'Invalid token',
        ErrorSeverity.ERROR
      );
    }

    if (!user || !user.email) {
      logger.error('Invalid user data from Supabase', {
        path: req.path,
        method: req.method,
        hasUser: !!user,
        hasEmail: !!user?.email,
        timestamp: new Date().toISOString()
      });
      throw new AppError(
        HttpStatus.UNAUTHORIZED,
        ErrorCode.INVALID_CREDENTIALS,
        'Invalid token',
        ErrorSeverity.ERROR
      );
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role as UserRole || 'user'
    };

    logger.info('Session validated successfully', {
      path: req.path,
      method: req.method,
      userId: user.id,
      userEmail: user.email,
      userRole: user.role || 'user',
      timestamp: new Date().toISOString()
    });

    next();
  } catch (error) {
    logger.error('Session validation failed', {
      error,
      path: req.path,
      method: req.method,
      isError: error instanceof Error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    next(error);
  }
}

/**
 * Check if user has required role
 */
export function checkRole(role: UserRole) {
  return (req: Request, res: Response, next: NextFunction) => {
    logger.info('Checking user role', {
      path: req.path,
      method: req.method,
      requiredRole: role,
      userRole: req.user?.role,
      timestamp: new Date().toISOString()
    });

    if (!req.user) {
      const error = new AppError(
        HttpStatus.UNAUTHORIZED,
        ErrorCode.INVALID_CREDENTIALS,
        'User not authenticated',
        ErrorSeverity.ERROR
      );
      logger.error('Role check failed - no user', {
        path: req.path,
        method: req.method,
        requiredRole: role,
        timestamp: new Date().toISOString()
      });
      throw error;
    }

    if (req.user.role !== role) {
      const error = new AppError(
        HttpStatus.FORBIDDEN,
        ErrorCode.INVALID_CREDENTIALS,
        'Insufficient permissions',
        ErrorSeverity.ERROR
      );
      logger.error('Role check failed - wrong role', {
        path: req.path,
        method: req.method,
        userRole: req.user.role,
        requiredRole: role,
        timestamp: new Date().toISOString()
      });
      throw error;
    }

    logger.info('Role check passed', {
      path: req.path,
      method: req.method,
      userRole: req.user.role,
      requiredRole: role,
      timestamp: new Date().toISOString()
    });

    next();
  };
} 