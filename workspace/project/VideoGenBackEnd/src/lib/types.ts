export const TYPES = {
  // Core services
  Logger: Symbol('Logger'),
  StorageService: 'StorageService',
  CoreValidationService: 'CoreValidationService',
  CoreMonitoringService: 'CoreMonitoringService',
  
  // Auth services
  AuthService: 'AuthService',
  
  // Project services
  ProjectService: 'ProjectService',
  ProjectRepository: 'ProjectRepository',
  
  // Video services
  VideoRepository: 'VideoRepository',
  VideoService: 'VideoService',
  VideoValidationService: 'VideoValidationService',
  VideoProcessingService: 'VideoProcessingService',
  VideoGenerationService: 'VideoGenerationService',
  VideoEventEmitter: 'VideoEventEmitter',
  VideoStateMachine: 'VideoStateMachine',
  VideoCleanupService: 'VideoCleanupService',
  
  // Runway services
  RunwayClient: 'RunwayClient',
  RunwayService: 'RunwayService',
  
  // Image services
  ImageRepository: 'ImageRepository',
  ImageService: 'ImageService',
  ImageValidationService: 'ImageValidationService',
  ImageStorageService: 'ImageStorageService',
  ImageCleanupService: 'ImageCleanupService',
  
  // Discovery services
  DiscoveryRepository: 'DiscoveryRepository',
  DiscoveryService: 'DiscoveryService',
  
  // Payment services
  PaymentService: 'PaymentService',
  PaymentRepository: 'PaymentRepository',
  MockPaymentService: 'MockPaymentService',
  PayPalPaymentService: 'PayPalPaymentService',
  
  // Token services
  TokenService: 'TokenService',
  TokenRepository: 'TokenRepository',
  
  // Other services
  MonitoringService: 'MonitoringService'
} as const;

// Type for injection tokens
export type ServiceType = keyof typeof TYPES; 