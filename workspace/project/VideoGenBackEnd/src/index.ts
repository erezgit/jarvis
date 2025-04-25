import 'reflect-metadata';  // Must be first
import 'dotenv/config';

console.log('=== Starting main application (src/index.ts) ===');

import { container } from 'tsyringe';
import './config/container';  // Load container configuration
import app from './app';
import { logger } from './lib/server/logger';
import { config } from './config';
import express from 'express';

// Log configuration status
logger.info('Application configuration loaded', {
  environment: config.environment,
  hasRunwayApiKey: !!config.runwayApiKey,
  hasSupabaseUrl: !!config.supabase.url,
  hasSupabaseAnonKey: !!config.supabase.anonKey,
  hasSupabaseServiceRoleKey: !!config.supabase.serviceRoleKey,
  isTest: config.isTest,
  timestamp: new Date().toISOString()
});

// Increase JSON and URL-encoded body parser limits
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Increase the HTTP request timeout for all requests
app.use((req, res, next) => {
  req.setTimeout(600000); // 10 minutes (increased from 5 minutes)
  res.setTimeout(600000); // 10 minutes (increased from 5 minutes)
  
  // Add keep-alive headers to prevent connection timeouts
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Keep-Alive', 'timeout=600');
  
  next();
});

// Start server
const port = 3000; // Force port 3000 no matter what

// Add a test endpoint to verify the server is running
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

console.log(`Attempting to start server on port ${port}...`);

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Server is now running on port ${port}`);
  logger.info(`Server started on port ${port}`, {
    timestamp: new Date().toISOString()
  });
});

// Set server-level timeouts
server.timeout = 600000; // 10 minutes
server.keepAliveTimeout = 600000; // 10 minutes
server.headersTimeout = 605000; // 10 minutes + 5 seconds 

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server', {
    timestamp: new Date().toISOString()
  });
  server.close(() => {
    logger.info('HTTP server closed', {
      timestamp: new Date().toISOString()
    });
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server', {
    timestamp: new Date().toISOString()
  });
  server.close(() => {
    logger.info('HTTP server closed', {
      timestamp: new Date().toISOString()
    });
    process.exit(0);
  });
}); 