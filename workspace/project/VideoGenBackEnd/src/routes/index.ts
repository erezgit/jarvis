import { Router } from 'express';
import authRouter from './auth';
import healthRouter from './health';
import projectsRouter from './projects';
import imageUploadRouter from './images.routes';
import videoGenerationRouter from './videoGeneration.routes';
import promptRouter from './prompt.routes';
import discoveryRouter from './discovery.routes';
import { logger } from '../lib/server/logger';

const router = Router();

// Mount API routes
router.use('/auth', authRouter);
router.use('/health', healthRouter);
router.use('/projects', projectsRouter);
router.use('/images', imageUploadRouter);
router.use('/videos', videoGenerationRouter);
router.use('/prompts', promptRouter);
router.use('/discoveries', discoveryRouter);

// Log route registration
logger.info('API routes registered', {
  routes: [
    '/api/auth/*',
    '/api/health/*',
    '/api/projects/*',
    '/api/images/*',
    '/api/videos/*',
    '/api/prompts/*',
    '/api/discoveries/*'
  ]
});

export default router; 