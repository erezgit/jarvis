import { Options } from 'express-rate-limit';
import { Request } from 'express';

/**
 * Get client IP with proxy support
 */
const getClientIp = (req: Request): string => {
  // When behind proxy, req.ip is already set to the correct client IP
  // due to 'trust proxy' setting in app configuration
  return req.ip || req.socket.remoteAddress || 'unknown';
};

/**
 * Base Rate Limit Configuration
 * Shared settings for all rate limiters
 */
const baseConfig: Partial<Options> = {
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: getClientIp, // Use our proxy-aware IP getter
  handler: (req, res) => {
    res.status(429).json({
      error: {
        code: 'rate_limit_exceeded',
        message: 'Too many requests, please try again later.',
        status: 429
      }
    });
  }
};

/**
 * General Rate Limiting Configuration
 */
export const rateLimitConfig: Partial<Options> = {
  ...baseConfig,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: {
      code: 'rate_limit_exceeded',
      message: 'Too many requests, please try again later.',
      status: 429
    }
  }
};

/**
 * Authentication Rate Limiting Configuration
 * More strict limits for authentication-related endpoints
 */
export const authRateLimitConfig: Partial<Options> = {
  ...baseConfig,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: {
    error: {
      code: 'auth_rate_limit_exceeded',
      message: 'Too many login attempts, please try again later.',
      status: 429
    }
  }
}; 