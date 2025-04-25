import { Request, Response, NextFunction } from 'express';
import { getClient } from '../../config/supabase';
import { AuthErrorCode } from '../../types';
import { logger } from '../../lib/server/logger';
import { tokenConfig } from '../config/token.config';
import { createServerSupabase } from '../../lib/supabase';
import type { User } from '@supabase/supabase-js';

/**
 * Middleware to check if session is valid using Supabase
 */
export const validateSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    next();
    return;
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    next();
    return;
  }

  try {
    const { data: { session }, error } = await getClient().auth.getSession();
    if (error || !session) {
      res.status(401).json({
        error: {
          code: AuthErrorCode.INVALID_TOKEN,
          message: 'Invalid or expired session',
          status: 401
        }
      });
      return;
    }
    next();
  } catch (error) {
    next(error);
  }
};

export class TokenValidator {
  /**
   * Validates a token and returns the authenticated user
   */
  async validate(token?: string): Promise<User> {
    try {
      logger.info('[Security] Starting token validation', {
        hasToken: !!token,
        timestamp: new Date().toISOString()
      });

      if (!token) {
        logger.warn('[Security] No token provided', {
          timestamp: new Date().toISOString()
        });
        throw new Error('No token provided');
      }

      // Validate token format
      if (!this.validateTokenFormat(token)) {
        logger.warn('[Security] Invalid token format', {
          timestamp: new Date().toISOString()
        });
        throw new Error('Invalid token format');
      }

      // Get actual token without scheme
      const actualToken = this.extractToken(token);

      // Validate with Supabase
      const supabase = createServerSupabase();
      const { data: { user }, error } = await supabase.auth.getUser(actualToken);

      if (error || !user) {
        logger.error('[Security] Token validation failed', {
          error: error?.message,
          timestamp: new Date().toISOString()
        });
        throw new Error('Invalid token');
      }

      logger.info('[Security] Token validation successful', {
        userId: user.id,
        timestamp: new Date().toISOString()
      });

      return user;
    } catch (error) {
      logger.error('[Security] Token validation error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  /**
   * Validates token format (Bearer scheme)
   */
  private validateTokenFormat(token: string): boolean {
    return token.startsWith(`${tokenConfig.header.scheme} `);
  }

  /**
   * Extracts actual token from Authorization header value
   */
  private extractToken(token: string): string {
    return token.replace(`${tokenConfig.header.scheme} `, '');
  }
} 