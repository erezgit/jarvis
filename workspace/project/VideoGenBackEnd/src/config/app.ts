import { Application } from 'express';

interface AppConfig {
  env: string;
  isDevelopment: boolean;
  isProduction: boolean;
  isTest: boolean;
  name: string;
  version: string;
  isReplit: boolean;
}

// Application configuration with defaults
export const appConfig: AppConfig = {
  env: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  name: process.env.APP_NAME || 'express-typescript-api',
  version: process.env.APP_VERSION || '1.0.0',
  isReplit: Boolean(process.env.REPL_ID) // Check if running on Replit
};

/**
 * Initialize application settings
 */
export const initializeApp = (app: Application): void => {
  // Set application settings
  app.set('name', appConfig.name);
  app.set('version', appConfig.version);
  app.set('env', appConfig.env);

  // Disable x-powered-by header for security
  app.disable('x-powered-by');

  // Trust proxy if in production or on Replit
  if (appConfig.isProduction || appConfig.isReplit) {
    app.enable('trust proxy');
  }
}; 