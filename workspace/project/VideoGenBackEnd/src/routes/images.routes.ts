import { Router } from 'express';
import { container } from 'tsyringe';
import { UploadedFile } from 'express-fileupload';
import { TYPES } from '../lib/types';
import { ImageService } from '../services/image/service';
import { validateSession } from '../middleware/session';
import { limiter } from '../middleware/rateLimit';
import { checkUploadQuota } from '../middleware/auth';
import { createEnhancedFileUploadMiddleware } from '../middleware/enhanced-upload';
import { logger } from '../lib/server/logger';
import { monitoringService } from '../services/core/monitoring/service';
import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../services/auth/guards/types';
import { ImageError, ImageValidationError } from '../services/image/errors';

const router = Router();
const imageService = container.resolve<ImageService>(TYPES.ImageService);

// Create a single, more robust file upload middleware
const fileUploadMiddleware = createEnhancedFileUploadMiddleware({
  limits: { fileSize: 25 * 1024 * 1024 }, // Increase to 25MB
  abortOnLimit: true,
  responseOnLimit: 'File size limit has been reached',
  debug: true,
  useTempFiles: true,
  tempFileDir: '/tmp/',
  safeFileNames: true,
  preserveExtension: true,
  createParentPath: true,
  parseNested: true,
  uploadTimeout: 600000 // Increase to 10 minutes
});

// Log route registration
logger.info('Image routes registered', {
  routes: [
    'POST /upload - Upload image',
    'GET /status/:projectId - Get status',
    'DELETE /:projectId - Delete image'
  ],
  middleware: ['limiter', 'validateSession', 'checkUploadQuota', 'fileUploadMiddleware']
});

// Upload endpoint with rate limiting and quota check
router.post(
  '/upload',
  limiter,
  validateSession,
  checkUploadQuota,
  // Use only the enhanced file upload middleware
  fileUploadMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    
    try {
      const authReq = req as AuthenticatedRequest;
      
      // Log request details
      logger.info('Image upload request received', {
        hasFiles: !!req.files,
        fileCount: req.files ? Object.keys(req.files).length : 0,
        hasImageField: req.files && 'image' in req.files,
        headers: {
          contentType: req.headers['content-type'],
          contentLength: req.headers['content-length']
        },
        userId: authReq.user.id,
        timestamp: new Date().toISOString()
      });

      // Validate request
      if (!req.files || Object.keys(req.files).length === 0) {
        logger.error('No files in request', {
          files: req.files ? Object.keys(req.files) : [],
          body: Object.keys(req.body),
          timestamp: new Date().toISOString()
        });
        return res.status(400).json({ 
          success: false, 
          error: 'No files uploaded. Please select an image file to upload.' 
        });
      }
      
      if (!req.files.image) {
        logger.error('No image field in request', {
          availableFields: req.files ? Object.keys(req.files) : [],
          body: Object.keys(req.body),
          timestamp: new Date().toISOString()
        });
        return res.status(400).json({ 
          success: false, 
          error: 'No image field found. Please upload using the field name "image".' 
        });
      }
      
      const imageFile = req.files.image as UploadedFile;
      
      // Validate file type
      if (!imageFile.mimetype.startsWith('image/')) {
        logger.error('Invalid file type', {
          mimetype: imageFile.mimetype,
          filename: imageFile.name,
          timestamp: new Date().toISOString()
        });
        return res.status(400).json({
          success: false,
          error: `Invalid file type: ${imageFile.mimetype}. Please upload an image file.`
        });
      }

      // Upload image using service
      const result = await imageService.uploadProjectImage(
        imageFile,
        authReq.user.id
      );

      // Track metrics
      const duration = Date.now() - startTime;
      monitoringService.recordMetric('upload_duration', duration);

      if (!result.success) {
        throw result.error;
      }

      // Log the response being sent to the client
      logger.info('Sending successful response to client', {
        responseData: result.data,
        userId: authReq.user.id,
        duration,
        timestamp: new Date().toISOString()
      });

      res.json({
        success: true,
        data: result.data
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      monitoringService.recordMetric('error_rate', 1);
      
      logger.error('Image upload request failed', {
        error,
        duration,
        isValidationError: error instanceof ImageValidationError,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
        userId: (req as AuthenticatedRequest).user?.id,
        timestamp: new Date().toISOString()
      });

      if (error instanceof ImageValidationError) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      if (error instanceof ImageError) {
        return res.status(500).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Get image status endpoint
router.get(
  '/status/:projectId',
  validateSession,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthenticatedRequest;
      
      logger.info('Status check request received', {
        projectId: req.params.projectId,
        userId: authReq.user.id,
        timestamp: new Date().toISOString()
      });
      
      const result = await imageService.getProjectStatus(
        req.params.projectId,
        authReq.user.id
      );

      if (!result.success) {
        throw result.error;
      }
      
      res.json({
        success: true,
        data: result.data
      });

    } catch (error) {
      logger.error('Failed to get image status', {
        error,
        projectId: req.params.projectId,
        userId: (req as AuthenticatedRequest).user?.id,
        isError: error instanceof Error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      });
      
      if (error instanceof ImageError) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to get image status',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Delete image endpoint
router.delete(
  '/:projectId',
  validateSession,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authReq = req as AuthenticatedRequest;
      
      logger.info('Delete image request received', {
        projectId: req.params.projectId,
        userId: authReq.user.id,
        timestamp: new Date().toISOString()
      });

      // TODO: Implement delete functionality in service
      res.json({
        success: true
      });

    } catch (error) {
      logger.error('Failed to delete image', {
        error,
        projectId: req.params.projectId,
        userId: (req as AuthenticatedRequest).user?.id,
        isError: error instanceof Error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      });

      if (error instanceof ImageError) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to delete image',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

export default router; 