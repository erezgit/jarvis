import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { errorHandler } from './middleware/error';
import authRoutes from './routes/auth';
import healthRoutes from './routes/health';
import projectRoutes from './routes/projects';
import createVideoGenerationRouter from './routes/videoGeneration.routes';
import { logger } from './lib/server/logger';
import imageRoutes from './routes/images.routes';
import promptRoutes from './routes/prompt.routes';
import discoveryRoutes from './routes/discovery.routes';
import paymentRoutes from './routes/payment.routes';

const app = express();

// Trust proxy - configure for secure proxy handling
app.set('trust proxy', 'loopback, linklocal, uniquelocal');

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info('[Request] Incoming request', {
    path: req.path,
    method: req.method,
    query: req.query,
    userId: req.user?.id,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/videos', createVideoGenerationRouter());
app.use('/api/images', imageRoutes);
app.use('/api/prompts', promptRoutes);
app.use('/api/discoveries', discoveryRoutes);
app.use('/api/payments', paymentRoutes);

// Root route handler - Update to remove any test screen
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Video Generation Service API - Main Application',
    version: '1.0.0',
    status: 'running',
    endpoints: [
      '/api/auth',
      '/api/health',
      '/api/projects',
      '/api/videos',
      '/api/images',
      '/api/prompts',
      '/api/discoveries',
      '/api/payments'
    ]
  });
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  logger.warn('[Request] Route not found', {
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  res.status(404).json({
    error: {
      code: 'route/not-found',
      message: 'The requested resource was not found'
    }
  });
});

// Log route registration
logger.info('Application routes registered', {
  routes: [
    '/api/auth - Authentication endpoints',
    '/api/health - Health check endpoints',
    '/api/projects - Project management endpoints',
    '/api/videos - Video generation endpoints',
    '/api/images - Image upload endpoints',
    '/api/prompts - Prompt component endpoints',
    '/api/discoveries - Discovery management endpoints',
    '/api/payments - Payment management endpoints'
  ],
  timestamp: new Date().toISOString()
});

export default app; 