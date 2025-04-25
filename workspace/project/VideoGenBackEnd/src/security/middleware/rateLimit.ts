import rateLimit from 'express-rate-limit';
import { RequestHandler } from 'express';
import { rateLimitConfig, authRateLimitConfig } from '../config/rateLimit.config';

/**
 * General Rate Limiting Middleware
 * Applies rate limiting to all routes
 */
export const rateLimitMiddleware: RequestHandler = rateLimit(rateLimitConfig);

/**
 * Authentication Rate Limiting Middleware
 * Applies stricter rate limiting to authentication routes
 */
export const authRateLimitMiddleware: RequestHandler = rateLimit(authRateLimitConfig); 