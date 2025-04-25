import { ErrorCode } from '../types/errors';
import { CorsOptions } from 'cors';
import { appConfig } from './app';
import logger from './logger';

// CORS configuration for Replit
export const corsConfig: CorsOptions = {
  origin: (origin, callback) => {
    // Log the request origin for debugging
    logger.info('Request origin:', origin);
    
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) {
      callback(null, true);
      return;
    }

    // Allow Replit domains and localhost
    const allowedOrigins = [
      /\.repl\.co$/,
      /\.replit\.dev$/,
      /^https?:\/\/localhost/,
      /^https?:\/\/127\.0\.0\.1/
    ];

    if (allowedOrigins.some(pattern => pattern.test(origin))) {
      callback(null, true);
    } else {
      logger.warn(`Origin ${origin} not allowed by CORS`);
      callback(null, true); // Still allow in development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Length', 'Content-Type']
};

// Error handling configuration
export const errorConfig = {
  validation: {
    status: 400,
    code: ErrorCode.INVALID_INPUT
  },
  internal: {
    status: 500,
    code: ErrorCode.SERVER_ERROR,
    message: 'An unexpected error occurred'
  },
  notFound: {
    status: 404,
    code: ErrorCode.INVALID_INPUT,
    message: 'The requested resource was not found'
  }
};

// Monitoring configuration
export const monitorConfig = {
  morgan: {
    format: ':remote-addr - :method :url :status :res[content-length] - :response-time ms'
  },
  performance: {
    format: (method: string, url: string, duration: string) => ({
      type: 'performance',
      method,
      url,
      duration: `${duration}ms`
    })
  }
};

// Rate limiting configuration
export const rateLimitConfig = {
  test: {
    windowMs: 100, // 100ms in test
    max: 2 // 2 requests in test
  },
  production: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // 100 requests
  },
  options: {
    skipFailedRequests: false,
    standardHeaders: true,
    legacyHeaders: false
  },
  errorResponse: {
    status: 'error',
    message: 'Too many requests, please try again later'
  }
}; 