import { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/server/logger';

/**
 * Middleware to enhance request and response handling for file uploads
 * This addresses common issues with file uploads by increasing timeouts
 * and adding detailed logging.
 */
export const uploadEnhancerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Only apply to file upload routes
  if (req.path !== '/api/images/upload' && !req.path.includes('/upload')) {
    return next();
  }

  // Increase request and response timeouts
  req.setTimeout(300000); // 5 minutes
  res.setTimeout(300000); // 5 minutes

  // Log detailed request information
  logger.info('Enhanced upload middleware activated', {
    path: req.path,
    method: req.method,
    headers: {
      'content-type': req.headers['content-type'],
      'content-length': req.headers['content-length'],
      'transfer-encoding': req.headers['transfer-encoding'],
      'connection': req.headers['connection']
    },
    timestamp: new Date().toISOString()
  });

  // Track request body chunks
  let chunkCount = 0;
  let totalBytes = 0;
  let startTime = Date.now();
  let lastChunkTime = startTime;

  // Create a copy of the original request listeners
  const originalListeners = {
    data: req.listeners('data'),
    end: req.listeners('end'),
    error: req.listeners('error'),
    close: req.listeners('close'),
    aborted: req.listeners('aborted')
  };

  // Remove existing listeners
  req.removeAllListeners('data');
  req.removeAllListeners('end');
  req.removeAllListeners('error');
  req.removeAllListeners('close');
  req.removeAllListeners('aborted');

  // Add our enhanced listeners
  req.on('data', (chunk) => {
    chunkCount++;
    totalBytes += chunk.length;
    const now = Date.now();
    const timeSinceStart = now - startTime;
    const timeSinceLastChunk = now - lastChunkTime;
    lastChunkTime = now;

    if (chunkCount % 10 === 0) { // Log every 10th chunk to avoid excessive logging
      logger.info('Upload chunk received', {
        chunkNumber: chunkCount,
        chunkSize: chunk.length,
        totalBytesReceived: totalBytes,
        contentLength: req.headers['content-length'],
        progress: req.headers['content-length'] ? 
          `${Math.round((totalBytes / parseInt(req.headers['content-length'] as string)) * 100)}%` : 
          'unknown',
        timeSinceStart: `${timeSinceStart}ms`,
        timeSinceLastChunk: `${timeSinceLastChunk}ms`,
        timestamp: new Date().toISOString()
      });
    }

    // Call original data listeners
    originalListeners.data.forEach(listener => listener.call(req, chunk));
  });

  req.on('end', () => {
    const totalTime = Date.now() - startTime;
    logger.info('Upload request ended', {
      totalChunks: chunkCount,
      totalBytes: totalBytes,
      contentLength: req.headers['content-length'],
      totalTime: `${totalTime}ms`,
      bytesPerSecond: Math.round(totalBytes / (totalTime / 1000)),
      timestamp: new Date().toISOString()
    });

    // Call original end listeners
    originalListeners.end.forEach(listener => listener.call(req));
  });

  req.on('error', (err) => {
    logger.error('Upload request error', {
      error: err,
      errorMessage: err.message,
      errorStack: err.stack,
      totalChunksReceived: chunkCount,
      totalBytesReceived: totalBytes,
      contentLength: req.headers['content-length'],
      timestamp: new Date().toISOString()
    });

    // Call original error listeners
    originalListeners.error.forEach(listener => listener.call(req, err));
  });

  req.on('close', () => {
    if (!req.complete) {
      logger.warn('Upload request closed before completion', {
        totalChunksReceived: chunkCount,
        totalBytesReceived: totalBytes,
        contentLength: req.headers['content-length'],
        isComplete: req.complete,
        timestamp: new Date().toISOString()
      });
    }

    // Call original close listeners
    originalListeners.close.forEach(listener => listener.call(req));
  });

  req.on('aborted', () => {
    logger.warn('Upload request aborted', {
      totalChunksReceived: chunkCount,
      totalBytesReceived: totalBytes,
      contentLength: req.headers['content-length'],
      timestamp: new Date().toISOString()
    });

    // Call original aborted listeners
    originalListeners.aborted.forEach(listener => listener.call(req));
  });

  next();
}; 