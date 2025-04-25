import { container } from 'tsyringe';
import { StorageService } from '../services/video/storage/service';
import { VideoService } from '../services/video/service';
import { VideoGenerationRoutes } from '../routes/videoGeneration.routes';
import { VideoRepository } from '../services/video/db/repository';
import { VideoValidationService } from '../services/video/validation';
import { VideoProcessingService } from '../services/video/processing';
import { VideoGenerationService } from '../services/video/generation';
import { VideoStateMachine } from '../services/video/state-machine';
import { VideoEventEmitter } from '../services/video/events';
import { RunwayService } from '../services/video/runway/service';
import { RunwayClient } from '../services/video/runway/client';
import { GenerationCleanupService } from '../services/video/cleanup/service';
import { config } from './index';
import { logger } from '../lib/server/logger';
import { TYPES } from '../lib/types';
import { ProjectService } from '../services/project/service';
import { ProjectRepository } from '../services/project/db/repository';
import { Logger } from 'winston';
import { EventEmitter } from 'events';
import { ImageService } from '../services/image/service';
import { ImageRepository } from '../services/image/repository';
import { ImageStorageService } from '../services/image/storage/service';
import { ImageValidationService } from '../services/image/validation';
import { CleanupService } from '../services/image/cleanup/service';
import { monitoringService } from '../services/core/monitoring/service';
import { ValidationService } from '../services/core/validation/service';
import { AuthService } from '../services/auth/service';
import { DiscoveryService } from '../services/discovery/service';
import { DiscoveryRepository } from '../services/discovery/db/repository';
import { MockPaymentService } from '../services/payment/mock/client.service';
import { PaymentRepository } from '../services/payment/db/repository';
import { PaymentService } from '../services/payment/service';
import { TokenRepository } from '../services/token/db/repository';
import { TokenService } from '../services/token/service';
import { PayPalPaymentService } from '../services/payment/paypal/client.service';

if (!config.runwayApiKey) {
  throw new Error('Runway API key is required but not configured');
}

// Register core services
container.register<Logger>(TYPES.Logger, {
  useValue: logger
});

container.register(TYPES.CoreMonitoringService, {
  useValue: monitoringService
});

container.register(TYPES.CoreValidationService, {
  useClass: ValidationService
});

container.register(TYPES.StorageService, {
  useClass: StorageService
});

// Register auth service
container.register(TYPES.AuthService, {
  useClass: AuthService
});

// Register project services
container.register(TYPES.ProjectService, {
  useClass: ProjectService
});

container.register(TYPES.ProjectRepository, {
  useClass: ProjectRepository
});

// Register image services in correct dependency order
container.register(TYPES.ImageValidationService, {
  useClass: ImageValidationService
});

container.register(TYPES.ImageStorageService, {
  useClass: ImageStorageService
});

container.register(TYPES.ImageRepository, {
  useClass: ImageRepository
});

container.register(TYPES.ImageCleanupService, {
  useClass: CleanupService
});

container.register(TYPES.ImageService, {
  useClass: ImageService
});

// Register RunwayClient with configuration
container.register(TYPES.RunwayClient, {
  useValue: new RunwayClient({
    apiKey: config.runwayApiKey,
    maxRetries: 2,
    timeout: 5000
  })
});

// Register RunwayService with configuration
container.register(TYPES.RunwayService, {
  useValue: new RunwayService({
    apiKey: config.runwayApiKey,
    maxRetries: 2,
    timeout: 5000
  })
});

// Register video services
container.register(TYPES.VideoRepository, {
  useClass: VideoRepository
});

container.register(TYPES.VideoService, {
  useClass: VideoService
});

container.register(TYPES.VideoValidationService, {
  useClass: VideoValidationService
});

container.register(TYPES.VideoProcessingService, {
  useClass: VideoProcessingService
});

container.register(TYPES.VideoGenerationService, {
  useClass: VideoGenerationService
});

container.register(TYPES.VideoEventEmitter, {
  useValue: new EventEmitter()
});

container.register(TYPES.VideoStateMachine, {
  useClass: VideoStateMachine
});

container.register(TYPES.VideoCleanupService, {
  useClass: GenerationCleanupService
});

container.register('VideoGenerationRoutes', {
  useClass: VideoGenerationRoutes
});

// Register discovery services
container.register(TYPES.DiscoveryRepository, {
  useClass: DiscoveryRepository
});

container.register(TYPES.DiscoveryService, {
  useClass: DiscoveryService
});

// Register payment services
container.register(TYPES.PaymentRepository, {
  useClass: PaymentRepository
});

container.register(TYPES.PaymentService, {
  useClass: PaymentService
});

container.register(TYPES.MockPaymentService, {
  useClass: MockPaymentService
});

container.register(TYPES.PayPalPaymentService, {
  useClass: PayPalPaymentService
});

// Register token services
container.register(TYPES.TokenRepository, {
  useClass: TokenRepository
});

container.register(TYPES.TokenService, {
  useClass: TokenService
});

export { container }; 