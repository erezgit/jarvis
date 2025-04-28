import { CorsOptions } from 'cors';

/**
 * CORS Configuration
 * Defines allowed origins, methods, headers and other CORS-related settings
 */
export const corsConfig: CorsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 600 // 10 minutes
}; 