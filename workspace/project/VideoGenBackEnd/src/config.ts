import { logger } from './lib/server/logger';

// Load environment variables first
import 'dotenv/config';

// Required environment variables with descriptions
const requiredEnvVars = {
  SUPABASE_URL: 'Supabase project URL',
  SUPABASE_ANON_KEY: 'Supabase anonymous client key',
  SUPABASE_SERVICE_ROLE_KEY: 'Supabase service role key'
} as const;

// Optional environment variables with descriptions
const optionalEnvVars = {
  PAYPAL_SANDBOX_CLIENT_ID: 'PayPal Sandbox Client ID',
  PAYPAL_SANDBOX_CLIENT_SECRET: 'PayPal Sandbox Client Secret',
  PAYPAL_CLIENT_ID: 'PayPal Production Client ID',
  PAYPAL_CLIENT_SECRET: 'PayPal Production Client Secret'
} as const;

// Validate required environment variables
const missingVars = Object.entries(requiredEnvVars)
  .filter(([key]) => !process.env[key])
  .map(([key, desc]) => `${key} (${desc})`);

if (missingVars.length > 0) {
  const error = `Missing required environment variables in Replit Secrets:\n${missingVars.join('\n')}`;
  logger.error(error);
  throw new Error(error);
}

// Check for optional environment variables
const missingOptionalVars = Object.entries(optionalEnvVars)
  .filter(([key]) => !process.env[key])
  .map(([key, desc]) => `${key} (${desc})`);

if (missingOptionalVars.length > 0) {
  logger.warn(`Missing optional environment variables in Replit Secrets:\n${missingOptionalVars.join('\n')}`);
}

// Check for PayPal environment variables based on environment
const isProduction = process.env.NODE_ENV === 'production';
if (isProduction) {
  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    logger.warn('Production PayPal credentials missing. PayPal payments will not work in production.');
  }
} else {
  if (!process.env.PAYPAL_SANDBOX_CLIENT_ID || !process.env.PAYPAL_SANDBOX_CLIENT_SECRET) {
    logger.warn('Sandbox PayPal credentials missing. PayPal payments will not work in development/testing.');
  }
}

// Export validated configuration
export const config = {
  supabase: {
    url: process.env.SUPABASE_URL!,
    anonKey: process.env.SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!
  },
  paypal: {
    sandbox: {
      clientId: process.env.PAYPAL_SANDBOX_CLIENT_ID || '',
      clientSecret: process.env.PAYPAL_SANDBOX_CLIENT_SECRET || ''
    },
    production: {
      clientId: process.env.PAYPAL_CLIENT_ID || '',
      clientSecret: process.env.PAYPAL_CLIENT_SECRET || ''
    },
    isConfigured: isProduction 
      ? Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET)
      : Boolean(process.env.PAYPAL_SANDBOX_CLIENT_ID && process.env.PAYPAL_SANDBOX_CLIENT_SECRET)
  },
  runwayApiKey: process.env.RUNWAY_API_KEY || '',
  environment: process.env.NODE_ENV || 'development',
  isTest: process.env.NODE_ENV === 'test',
  isProduction
} as const;

// Log configuration status (excluding sensitive values)
logger.info('Application configuration loaded', {
  environment: config.environment,
  hasSupabaseUrl: !!config.supabase.url,
  hasSupabaseAnonKey: !!config.supabase.anonKey,
  hasServiceRoleKey: !!config.supabase.serviceRoleKey,
  hasRunwayApiKey: !!config.runwayApiKey,
  hasPayPalSandboxClientId: !!config.paypal.sandbox.clientId,
  hasPayPalSandboxClientSecret: !!config.paypal.sandbox.clientSecret,
  hasPayPalProductionClientId: !!config.paypal.production.clientId,
  hasPayPalProductionClientSecret: !!config.paypal.production.clientSecret,
  isPayPalConfigured: config.paypal.isConfigured
}); 