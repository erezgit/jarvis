import { EventEmitter } from 'events';
import { ErrorCode } from '../../types/errors';
import { UploadResponse, FileMetadata } from '../core/storage/types';

// Generation Status Types
export enum GenerationStatus {
  QUEUED = 'queued',
  PREPARING = 'preparing',
  GENERATING = 'generating',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

// Database Types
export interface DbGenerationCreate {
  user_id: string;
  project_id: string;
  prompt: string;
  status: GenerationStatus;
  metadata?: Record<string, unknown>;
}

export interface DbGenerationUpdate {
  status?: GenerationStatus;
  video_url?: string;
  error_message?: string;
  started_at?: string;
  completed_at?: string;
  updated_at?: string;
  metadata?: Record<string, unknown>;
}

// Type guard for runtime validation
export function isGenerationStatus(status: string): status is GenerationStatus {
  return Object.values(GenerationStatus).includes(status as GenerationStatus);
}

export interface GenerationMetadata {
  model?: string;
  fps?: number;
  duration?: number;
  width?: number;
  height?: number;
  runwayJobId?: string;
  [key: string]: any; // Allow for flexible metadata
}

export interface DbGeneration {
  id: string;
  user_id: string;
  project_id: string;
  prompt: string;
  status: GenerationStatus;
  video_url: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  started_at: string | null;
  completed_at: string | null;
  metadata: GenerationMetadata;
  model_id: string;
  duration: number;
  thumbnail_url: string | null;
}

// Core Types
export interface Generation {
  id: string;
  user_id: string;
  project_id: string;
  prompt: string;
  status: GenerationStatus;
  video_url?: string | null;
  error_message?: string | null;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, unknown>;
}

// API Request/Response Types
export interface VideoGenerationRequest {
  prompt: string;
  userId: string;
  projectId: string;
}

export interface VideoGenerationResult {
  success: boolean;
  generationId?: string;
  error?: string;
}

export interface VideoGenerationStatus {
  status: GenerationStatus;
  videoUrl: string | null | undefined;
  error: string | null | undefined;
  metadata: Record<string, unknown>;
}

// Processing Types
export interface VideoMetadata extends FileMetadata {
  dimensions?: {
    width: number;
    height: number;
  };
  duration?: number;
  frameRate?: number;
  codec?: string;
  bitrate?: number;
  format?: string;
  thumbnailUrl?: string;
  [key: string]: unknown;
}

export interface ProcessingResult {
  success: boolean;
  videoUrl?: string;
  error?: string;
  metadata?: VideoMetadata;
}

export interface ProcessingOptions {
  timeout: number;        // Download timeout in ms
  maxRetries?: number;     // Max retry attempts
  maxSize?: number;        // Max file size in bytes
  allowedTypes?: string[]; // Allowed content types
}

export type ProcessingStage = 'download' | 'validation' | 'upload';

export interface ProcessingStatusUpdate {
  status: GenerationStatus;
  stage?: ProcessingStage;
  progress?: number;
  metadata?: Partial<VideoMetadata>;
  error?: string;
}

// Validation Types
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  errors?: string[];
  metadata?: {
    contentType: string;
    size: number;
    duration?: number;
    dimensions?: {
      width: number;
      height: number;
    };
  };
}

// Event Types
export interface StatusChangeEvent {
  generationId: string;
  fromStatus: GenerationStatus;
  toStatus: GenerationStatus;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface ErrorEvent {
  generationId: string;
  status: GenerationStatus;
  error: Error;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export enum VideoEvents {
  STATUS_CHANGE = 'video:status:change',
  ERROR = 'video:status:error',
  COMPLETED = 'video:status:completed',
  FAILED = 'video:status:failed'
}

// State Machine Types
export interface StateHooks {
  beforeTransition?: (from: GenerationStatus, to: GenerationStatus) => Promise<void>;
  afterTransition?: (from: GenerationStatus, to: GenerationStatus) => Promise<void>;
  onError?: (error: Error, from: GenerationStatus, to: GenerationStatus) => Promise<void>;
}

// Service Interface
export interface IVideoService {
  // Generation operations
  startGeneration(request: VideoGenerationRequest): Promise<VideoGenerationResult>;
  getGenerationStatus(generationId: string, userId: string): Promise<VideoGenerationStatus>;
  
  // Event handling
  onStatusChange(listener: (event: StatusChangeEvent) => void): void;
  onError(listener: (event: ErrorEvent) => void): void;
  onCompleted(listener: (event: StatusChangeEvent) => void): void;
  onFailed(listener: (event: ErrorEvent) => void): void;
  
  // State management
  updateGenerationStatus(
    generationId: string,
    newStatus: GenerationStatus,
    metadata?: Record<string, unknown>
  ): Promise<void>;
}

// Service Interfaces
export interface IVideoGenerationService {
  startGeneration(
    userId: string,
    prompt: string,
    projectId: string
  ): Promise<VideoGenerationResult>;
  
  getGenerationStatus(
    generationId: string,
    userId: string
  ): Promise<VideoGenerationStatus>;
  
  handleGenerationComplete(
    generationId: string,
    videoUrl: string,
    metadata?: Record<string, unknown>
  ): Promise<void>;
  
  handleGenerationFailure(
    generationId: string,
    error: Error,
    metadata?: Record<string, unknown>
  ): Promise<void>;
}

// Constants
export const DEFAULT_PROCESSING_OPTIONS: ProcessingOptions = {
  timeout: 30000,        // 30 seconds
  maxRetries: 3,
  maxSize: 104857600,    // 100MB
  allowedTypes: [
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo'
  ]
};

/**
 * Video-specific upload response
 */
export interface VideoUploadResponse extends UploadResponse {
  duration?: number;
  dimensions?: {
    width: number;
    height: number;
  };
  thumbnailUrl?: string;
}

/**
 * Video upload result
 */
export interface VideoUploadResult {
  url: string;
  path: string;
  bucket: string;
  thumbnailUrl?: string;
  metadata: VideoMetadata;
}

// Re-export existing types
export * from './types'; 