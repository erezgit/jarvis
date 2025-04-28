import { Request, Response, NextFunction } from 'express';
import fileUpload, { Options } from 'express-fileupload';
import { logger } from '../lib/server/logger';
import path from 'path';
import fs from 'fs';

/**
 * Creates an enhanced file upload middleware with better timeout and debugging settings
 * This addresses the "Unexpected end of form" errors by increasing timeouts and buffer sizes
 */
export const createEnhancedFileUploadMiddleware = (options: Options = {}) => {
  // Ensure temp directory exists
  const tempDir = options.tempFileDir || '/tmp/';
  if (!fs.existsSync(tempDir)) {
    try {
      fs.mkdirSync(tempDir, { recursive: true });
      logger.info(`Created temp directory: ${tempDir}`);
    } catch (err) {
      logger.error(`Failed to create temp directory: ${tempDir}`, { error: err });
    }
  }

  // Create the enhanced middleware with better defaults
  const enhancedOptions: Options = {
    limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
    abortOnLimit: true,
    responseOnLimit: 'File size limit has been reached',
    debug: true, // Enable debug mode for more detailed logs
    useTempFiles: true, // Always use temp files to avoid memory issues
    tempFileDir: tempDir,
    parseNested: true,
    uploadTimeout: 600000, // 10 minutes in milliseconds
    createParentPath: true,
    safeFileNames: true,
    preserveExtension: true,
    // Add these options to fix "Unexpected end of form" errors
    highWaterMark: 2 * 1024 * 1024, // 2MB - larger buffer size
    ...options
  };

  // Create the file upload middleware
  const uploadMiddleware = fileUpload(enhancedOptions);

  // Return a wrapped version that adds request/response timeouts and better error handling
  return (req: Request, res: Response, next: NextFunction) => {
    // Set longer timeouts for the request and response
    req.setTimeout(600000); // 10 minutes
    res.setTimeout(600000); // 10 minutes

    // Add custom headers to prevent timeouts
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Keep-Alive', 'timeout=600');

    logger.info('Enhanced file upload middleware activated', {
      path: req.path,
      method: req.method,
      contentType: req.headers['content-type'],
      contentLength: req.headers['content-length'],
      uploadTimeout: enhancedOptions.uploadTimeout,
      fileSize: enhancedOptions.limits?.fileSize,
      highWaterMark: enhancedOptions.highWaterMark,
      useTempFiles: enhancedOptions.useTempFiles,
      tempFileDir: enhancedOptions.tempFileDir,
      timestamp: new Date().toISOString()
    });

    // Call the original middleware with better error handling
    uploadMiddleware(req, res, (err) => {
      if (err) {
        logger.error('Enhanced file upload middleware error', {
          error: err,
          errorMessage: err instanceof Error ? err.message : 'Unknown error',
          errorStack: err instanceof Error ? err.stack : undefined,
          path: req.path,
          method: req.method,
          contentType: req.headers['content-type'],
          contentLength: req.headers['content-length'],
          timestamp: new Date().toISOString()
        });

        // Handle specific error types
        if (err instanceof Error && err.message === 'Unexpected end of form') {
          return res.status(400).json({
            success: false,
            error: 'Upload interrupted. Please try again with a stable connection.',
            details: 'The file upload was interrupted before completion.'
          });
        }

        if (err instanceof Error && err.message.includes('limit')) {
          return res.status(413).json({
            success: false,
            error: 'File too large',
            details: err.message
          });
        }
      } else if (req.files) {
        // Log successful file upload details
        const fileCount = Object.keys(req.files).length;
        logger.info('Files uploaded successfully', {
          fileCount,
          fileNames: Object.keys(req.files).map(key => {
            const fileObj = req.files?.[key];
            if (!fileObj) return 'unknown';
            
            const file = Array.isArray(fileObj) 
              ? fileObj[0] 
              : fileObj;
            return file.name;
          }),
          hasTempFiles: Object.keys(req.files).some(key => {
            const fileObj = req.files?.[key];
            if (!fileObj) return false;
            
            const file = Array.isArray(fileObj) 
              ? fileObj[0] 
              : fileObj;
            return !!file.tempFilePath;
          }),
          timestamp: new Date().toISOString()
        });
      }
      
      next(err);
    });
  };
}; 