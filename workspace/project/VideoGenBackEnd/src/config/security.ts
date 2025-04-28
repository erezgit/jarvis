import { CorsOptions } from 'cors';
import { RateLimitRequestHandler, Options } from 'express-rate-limit';
import { HelmetOptions } from 'helmet';

// CORS Configuration
export const corsOptions: CorsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 600 // 10 minutes
};

// Rate Limiting Configuration
export const rateLimitOptions: Partial<Options> = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: {
      code: 'rate_limit_exceeded',
      message: 'Too many requests, please try again later.',
      status: 429
    }
  },
  standardHeaders: true,
  legacyHeaders: false
};

// Authentication Rate Limiting (more strict)
export const authRateLimitOptions: Partial<Options> = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: {
    error: {
      code: 'auth_rate_limit_exceeded',
      message: 'Too many login attempts, please try again later.',
      status: 429
    }
  },
  standardHeaders: true,
  legacyHeaders: false
};

// Helmet Security Headers
export const helmetOptions: HelmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", process.env.SUPABASE_URL || ''],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: { policy: "same-site" },
  dnsPrefetchControl: true,
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  ieNoOpen: true,
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  xssFilter: true
};

// Token Security Configuration
export const tokenConfig = {
  accessTokenExpiry: '15m', // 15 minutes
  refreshTokenExpiry: '7d', // 7 days
  tokenBlacklistDuration: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  blacklistErrorResponse: {
    error: {
      code: 'token_blacklisted',
      message: 'Token has been revoked',
      status: 401
    }
  }
}; 