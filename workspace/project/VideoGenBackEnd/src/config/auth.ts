import logger from './logger';
import { Router } from 'express';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

/**
 * Validates and loads Supabase configuration
 */
export const loadSupabaseConfig = (): SupabaseConfig => {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  // Check required variables
  const missing = [];
  if (!url) missing.push('SUPABASE_URL');
  if (!anonKey) missing.push('SUPABASE_ANON_KEY');

  if (missing.length > 0) {
    const error = `Missing required environment variables: ${missing.join(', ')}`;
    logger.error(error);
    throw new Error(error);
  }

  // At this point we know url exists due to the check above
  const supabaseUrl = url as string;

  // Validate URL format
  if (!supabaseUrl.match(/^https:\/\/.+\.supabase\.co$/)) {
    const error = `Invalid SUPABASE_URL format: ${supabaseUrl}. Expected format: https://<project>.supabase.co`;
    logger.error(error);
    throw new Error(error);
  }

  // Log configuration state (without secrets)
  logger.info('Supabase configuration loaded', {
    url: supabaseUrl,
    hasAnonKey: !!anonKey
  });

  return {
    url: supabaseUrl,
    anonKey: anonKey!
  };
};

// Development-only debug endpoints
if (process.env.NODE_ENV === 'development') {
  const router = Router();

  router.get('/debug/auth-config', (req, res) => {
    const config = loadSupabaseConfig();

    res.json({
      supabase: {
        url: config.url,
        hasAnonKey: !!config.anonKey
      }
    });
  });

  // Export router for development use
  module.exports = router;
} 