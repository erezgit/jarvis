import { Express, ErrorRequestHandler } from 'express';
import { httpLogger, performanceLogger, errorLogger } from './logging';
import { errorHandler, notFoundHandler } from './error';
import express from 'express';
import {
  corsMiddleware,
  securityHeaders,
  rateLimitMiddleware
} from '../security';

/**
 * Middleware Application Order:
 * 1. Security (First line of defense)
 *    - CORS
 *    - Security Headers
 *    - Rate Limiting
 * 2. Body Parsing (Required before processing any request body)
 * 3. Logging (To log request details after security checks)
 * 4. Session Validation (Before routes, after logging)
 * 5. Routes (Application logic)
 * 6. Error Handling (Must be last)
 */

export const applyMiddleware = (app: Express): void => {
  // 1. Security Middleware
  app.use(corsMiddleware);        // Handle CORS before any request
  app.use(securityHeaders);       // Set security headers early
  app.use(rateLimitMiddleware);   // Protect against DoS

  // 2. Body Parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // 3. Logging Middleware
  app.use(httpLogger);           // Log HTTP requests
  app.use(performanceLogger);    // Track request performance

  // 4. Session Validation is applied per-route

  // 5. Routes are mounted in index.ts

  // 6. Error Handling (must be last)
  app.use(errorLogger);          // Log any errors
  app.use(errorHandler as ErrorRequestHandler);  // Handle known errors
  app.use(notFoundHandler);      // Handle 404s
};

// Export individual middleware for testing and specific use cases
export {
  // Security
  corsMiddleware,
  securityHeaders,
  rateLimitMiddleware,
  
  // Logging
  httpLogger,
  performanceLogger,
  errorLogger,
  
  // Error Handling
  errorHandler,
  notFoundHandler
};

// Export feature-specific middleware
export * from './auth';
export * from './error';
export * from './validation';
export * from './logging';
export * from './session'; 