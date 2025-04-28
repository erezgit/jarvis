import { Router, Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { TYPES } from '../lib/types';
import { VideoGenerationService } from '../services/video/generation';
import { VideoValidationService } from '../services/video/validation';
import { VideoGenerationRequest, VideoGenerationResult, VideoGenerationStatus, StatusChangeEvent, ErrorEvent } from '../services/video/types';
import { VideoError, VideoValidationError } from '../services/video/errors';
import { ErrorCode, HttpStatus } from '../types/errors';
import { validateSession } from '../middleware/session';
import { logger } from '../lib/server/logger';

export class VideoGenerationRoutes {
  private router: Router;
  private videoGenerationService: VideoGenerationService;
  private validationService: VideoValidationService;

  constructor() {
    this.router = Router();
    this.videoGenerationService = container.resolve<VideoGenerationService>(TYPES.VideoGenerationService);
    this.validationService = container.resolve<VideoValidationService>(TYPES.VideoValidationService);
    this.setupRoutes();
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // No event listeners needed for now
  }

  private validateGenerationRequest(req: Request, res: Response, next: NextFunction): void {
    try {
      const { projectId, prompt } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new VideoError(
          ErrorCode.UNAUTHORIZED,
          'User not authenticated'
        );
      }

      const validationResult = this.validationService.validateGenerationRequest(
        projectId,
        prompt,
        userId,
        req.body.metadata
      );

      if (!validationResult.isValid) {
        throw new VideoValidationError(
          validationResult.error || 'Invalid generation request'
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  }

  private setupRoutes(): void {
    // Apply session validation to all routes
    this.router.use(validateSession);

    // Start generation
    this.router.post(
      '/generate',
      this.validateGenerationRequest.bind(this),
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          const { projectId, prompt } = req.body;
          const userId = req.user!.id;

          const result = await this.videoGenerationService.startGeneration(
            userId,
            prompt,
            projectId
          );
          
          res.status(HttpStatus.OK).json(result);
        } catch (error) {
          next(error);
        }
      }
    );

    // Get generation status
    this.router.get(
      '/status/:generationId',
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          const status = await this.videoGenerationService.getGenerationStatus(
            req.params.generationId,
            req.user!.id
          );
          res.status(HttpStatus.OK).json(status);
        } catch (error) {
          next(error);
        }
      }
    );

    // SSE endpoint for real-time updates
    this.router.get(
      '/events',
      (req: Request, res: Response) => {
        const userId = req.user!.id;

        // Set up SSE headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        // Send initial connection message
        res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

        // Handle client disconnect
        req.on('close', () => {
          logger.info('SSE client disconnected', { userId });
        });
      }
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}

export default function createVideoGenerationRouter(): Router {
  const routes = new VideoGenerationRoutes();
  return routes.getRouter();
} 