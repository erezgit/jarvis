import morgan, { StreamOptions } from 'morgan';
import logger, { sanitizeRequest, loggingConfig, logFormats } from '../config/logger';
import { Request, Response, NextFunction, RequestHandler, ErrorRequestHandler } from 'express';

// Create a stream that writes to our Winston logger
const stream: StreamOptions = {
  write: (message: string) => logger.info(message.trim())
};

// Create Morgan middleware
export const httpLogger = morgan(loggingConfig.httpFormat, { stream });

// Performance logging middleware
export const performanceLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime();

  // Log request
  logger.info('Incoming request', {
    request: sanitizeRequest(req)
  });

  // Log response
  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds * 1000 + nanoseconds / 1000000; // Convert to milliseconds

    logger.info('Request completed', 
      logFormats.requestCompleted(
        req.method,
        req.url,
        res.statusCode,
        `${duration.toFixed(2)}ms`
      )
    );
  });

  next();
};

// Error logging middleware
export const errorLogger = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Error occurred', logFormats.error(err, sanitizeRequest(req)));
  next(err);
};

export const requestLogging = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Log at start of request
    logger.info('Request received', {
      method: req.method,
      path: req.path,
      baseUrl: req.baseUrl,
      originalUrl: req.originalUrl,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });

    // Log response
    res.on('finish', () => {
      logger.info('Response sent', {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        timestamp: new Date().toISOString()
      });
    });

    next();
  };
};

interface RequestLogInfo {
  method: string;
  path: string;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  sessionId?: string;
  timestamp: string;
}

/**
 * Middleware to log authentication-related requests
 */
export const authRequestLogger: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const logInfo: RequestLogInfo = {
    method: req.method,
    path: req.path,
    timestamp: new Date().toISOString()
  };

  // Capture response using a closure
  const cleanup = () => {
    const duration = Date.now() - startTime;
    
    // Add user info if available
    if (req.user) {
      logInfo.userId = req.user.id;
      logInfo.userEmail = req.user.email;
      logInfo.userRole = req.user.role;
    }

    // Log session ID if available
    const sessionId = req.headers['x-session-id'] || req.headers.authorization?.split(' ')[1]?.substring(0, 8);
    if (sessionId) {
      logInfo.sessionId = `${sessionId}...`;
    }

    // Log the request details
    logger.info('Auth Request', {
      ...logInfo,
      statusCode: res.statusCode,
      duration: `${duration}ms`
    });

    // Clean up event listeners
    res.removeListener('finish', cleanup);
    res.removeListener('close', cleanup);
  };

  // Listen for response events
  res.on('finish', cleanup);
  res.on('close', cleanup);

  next();
};

/**
 * Middleware to log session events (refresh, validation, etc.)
 */
export const sessionEventLogger: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const originalEnd = res.end;
  const startTime = Date.now();

  // Override end to capture response
  res.end = function(chunk?: any, encoding?: any, callback?: any): Response {
    const duration = Date.now() - startTime;
    
    logger.info('Session Event', {
      type: 'session_validation',
      userId: req.user?.id,
      userEmail: req.user?.email,
      status: res.statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });

    return originalEnd.call(this, chunk, encoding, callback);
  };

  next();
};

/**
 * Middleware to log authentication errors
 */
export const authErrorLogger: ErrorRequestHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error('Authentication Error', {
    error: {
      code: err.code,
      message: err.message,
      status: err.status
    },
    request: {
      method: req.method,
      path: req.path,
      userId: req.user?.id,
      timestamp: new Date().toISOString()
    }
  });

  next(err);
}; 