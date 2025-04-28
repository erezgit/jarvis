import { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/server/logger';

/**
 * Enhanced debugging middleware for file uploads
 * This middleware adds detailed logging of the request stream to help diagnose
 * issues with file uploads, particularly the "Unexpected end of form" error.
 */
export const uploadDebugMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Only apply to file upload routes
  if (req.path !== '/api/images/upload' || req.method !== 'POST') {
    return next();
  }

  // Log detailed request information
  logger.info('🔍 DEBUG: Upload request started', {
    path: req.path,
    method: req.method,
    headers: {
      'content-type': req.headers['content-type'],
      'content-length': req.headers['content-length'],
      'transfer-encoding': req.headers['transfer-encoding'],
      'connection': req.headers['connection'],
      'user-agent': req.headers['user-agent']
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

  // Add our debug listeners
  req.on('data', (chunk) => {
    chunkCount++;
    totalBytes += chunk.length;
    const now = Date.now();
    const timeSinceStart = now - startTime;
    const timeSinceLastChunk = now - lastChunkTime;
    lastChunkTime = now;

    logger.info('🔍 DEBUG: Upload chunk received', {
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

    // Call original data listeners
    originalListeners.data.forEach(listener => listener.call(req, chunk));
  });

  req.on('end', () => {
    const totalTime = Date.now() - startTime;
    logger.info('🔍 DEBUG: Upload request ended', {
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
    logger.error('🔍 DEBUG: Upload request error', {
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
      logger.warn('🔍 DEBUG: Upload request closed before completion', {
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
    logger.warn('🔍 DEBUG: Upload request aborted', {
      totalChunksReceived: chunkCount,
      totalBytesReceived: totalBytes,
      contentLength: req.headers['content-length'],
      timestamp: new Date().toISOString()
    });

    // Call original aborted listeners
    originalListeners.aborted.forEach(listener => listener.call(req));
  });

  // Monitor response as well
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any, callback?: any) {
    logger.info('🔍 DEBUG: Upload response sent', {
      statusCode: res.statusCode,
      statusMessage: res.statusMessage,
      headers: res.getHeaders(),
      totalRequestChunks: chunkCount,
      totalRequestBytes: totalBytes,
      timestamp: new Date().toISOString()
    });
    return originalEnd.call(this, chunk, encoding, callback);
  };

  next();
}; 