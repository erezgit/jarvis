import { logger } from '../../lib/server/logger';

/**
 * Token Security Configuration
 * Defines token-related settings and error responses
 */
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
  },

  // Header configuration
  header: {
    name: 'Authorization',
    scheme: 'Bearer'
  },

  // Token settings
  settings: {
    maxAge: '1h',
    audience: 'api',
    issuer: 'auth-service'
  },

  // Validation rules
  validation: {
    requireScheme: true,
    validateAudience: true,
    validateIssuer: true,
    validateExpiry: true
  }
} as const;

// Log configuration loading
logger.info('[Security] Token configuration loaded', {
  header: tokenConfig.header.name,
  scheme: tokenConfig.header.scheme,
  maxAge: tokenConfig.settings.maxAge,
  timestamp: new Date().toISOString()
}); 