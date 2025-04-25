import { Express } from 'express';
import logger from './logger';
import { initializeSupabase } from './supabase';
import { logNetworkInfo } from '../utils/network-debug';

// Basic server configuration
const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = '0.0.0.0';  // Required for Replit

/**
 * Get the Replit URL for the current project
 */
const getReplitUrl = (): string => {
  const { REPL_SLUG, REPL_OWNER } = process.env;
  if (REPL_SLUG && REPL_OWNER) {
    return `https://${REPL_SLUG}.${REPL_OWNER}.repl.co`;
  }
  return '';
};

/**
 * Start the server
 */
export const startServer = async (app: Express): Promise<void> => {
  try {
    // Log startup attempt
    logger.info('Starting server...', {
      port: PORT,
      host: HOST,
      nodeEnv: process.env.NODE_ENV
    });

    // Initialize Supabase
    await initializeSupabase();
    logger.info('Supabase initialized');
    
    // Log network information before starting
    logNetworkInfo();
    
    // Start server
    const server = app.listen(PORT, HOST, () => {
      const replitUrl = getReplitUrl();
      logger.info('Server is running', {
        port: PORT,
        host: HOST,
        nodeEnv: process.env.NODE_ENV,
        replitUrl: replitUrl || 'Not in Replit environment'
      });
      
      // Log additional deployment info
      logger.info('Deployment information', {
        baseUrl: process.env.BASE_URL || 'Not set',
        replSlug: process.env.REPL_SLUG || 'Not set',
        replOwner: process.env.REPL_OWNER || 'Not set',
        deploymentId: process.env.DEPLOYMENT_ID || 'Not set'
      });
    });

    // Add error handler
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        logger.error('Port is already in use', {
          port: PORT,
          error: error.message
        });
        process.exit(1);
      } else {
        logger.error('Server error:', {
          error: error.message,
          stack: error.stack
        });
      }
    });

    // Add graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error('Failed to start server:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    process.exit(1);
  }
}; 