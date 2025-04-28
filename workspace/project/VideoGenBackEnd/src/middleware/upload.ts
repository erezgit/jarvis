import { Request, Response, NextFunction } from 'express';
import fileUpload, { UploadedFile, FileArray, Options } from 'express-fileupload';
import { logger } from '../lib/server/logger';
import { AppError } from '../errors/base';
import { ErrorCode, ErrorSeverity, HttpStatus } from '../types/errors';

// Create a wrapper for the file upload middleware with logging
export const createFileUploadMiddleware = (options: Options = {}) => {
  // Create the base middleware
  const uploadMiddleware = fileUpload({
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    abortOnLimit: true,
    responseOnLimit: 'File size limit has been reached',
    debug: false, // Set to false in production to reduce noise
    useTempFiles: true,
    tempFileDir: '/tmp/',
    parseNested: true, // Better handling of nested form fields
    uploadTimeout: 60000, // 60 seconds timeout for uploads
    createParentPath: true, // Create parent path if it doesn't exist
    safeFileNames: true, // Remove special characters from file names
    preserveExtension: true, // Preserve file extensions
    ...options
  });

  // Return a wrapped version with logging
  return (req: Request, res: Response, next: NextFunction) => {
    logger.info('Starting file upload middleware', {
      path: req.path,
      method: req.method,
      contentType: req.headers['content-type'],
      contentLength: req.headers['content-length'],
      timestamp: new Date().toISOString()
    });

    // Add logging to the upload events
    const originalReq = req;
    const wrappedReq = Object.create(req);

    // Override the req.files setter to log when files are attached
    Object.defineProperty(wrappedReq, 'files', {
      set(files: FileArray | undefined) {
        logger.info('Files attached to request', {
          hasFiles: !!files,
          fileCount: files ? Object.keys(files).length : 0,
          fileNames: files ? Object.keys(files) : [],
          timestamp: new Date().toISOString()
        });

        if (files) {
          // Log details for each file
          Object.entries(files).forEach(([fieldName, file]) => {
            const fileInfo = Array.isArray(file) ? file[0] : file;
            logger.info('File details', {
              fieldName,
              name: fileInfo.name,
              size: fileInfo.size,
              mimeType: fileInfo.mimetype,
              encoding: fileInfo.encoding,
              tempFilePath: fileInfo.tempFilePath,
              truncated: fileInfo.truncated,
              md5: fileInfo.md5,
              timestamp: new Date().toISOString()
            });

            // Check for potential issues
            if (fileInfo.truncated) {
              logger.warn('File was truncated', {
                fieldName,
                name: fileInfo.name,
                size: fileInfo.size,
                limit: options.limits?.fileSize,
                timestamp: new Date().toISOString()
              });
            }
          });
        }

        Object.defineProperty(originalReq, 'files', {
          value: files,
          writable: true,
          enumerable: true,
          configurable: true
        });
      },
      get() {
        return originalReq.files;
      }
    });

    // Call the original middleware with our wrapped request
    uploadMiddleware(wrappedReq, res, (err: any) => {
      if (err) {
        // Enhanced error logging with more context
        logger.error('File upload middleware error', {
          error: err,
          path: req.path,
          method: req.method,
          isError: err instanceof Error,
          errorMessage: err instanceof Error ? err.message : 'Unknown error',
          errorStack: err instanceof Error ? err.stack : undefined,
          contentType: req.headers['content-type'],
          contentLength: req.headers['content-length'],
          timestamp: new Date().toISOString()
        });

        // Provide more specific error messages based on common issues
        let errorMessage = err.message || 'File upload failed';
        let errorCode = ErrorCode.UPLOAD_FAILED;
        
        if (errorMessage.includes('Unexpected end of form')) {
          errorMessage = 'Upload was interrupted. Please try again with a stable connection.';
          errorCode = ErrorCode.UPLOAD_INTERRUPTED;
        } else if (errorMessage.includes('limit')) {
          errorMessage = `File size exceeds the limit of ${options.limits?.fileSize ? Math.floor(options.limits.fileSize / (1024 * 1024)) : 10}MB.`;
          errorCode = ErrorCode.UPLOAD_SIZE_LIMIT;
        }

        // Convert to our error format
        const error = new AppError(
          HttpStatus.BAD_REQUEST,
          errorCode,
          errorMessage,
          ErrorSeverity.ERROR,
          { originalError: err }
        );
        next(error);
        return;
      }

      logger.info('File upload middleware completed', {
        path: req.path,
        method: req.method,
        hasFiles: !!req.files,
        fileCount: req.files ? Object.keys(req.files).length : 0,
        timestamp: new Date().toISOString()
      });

      next();
    });
  };
}; 