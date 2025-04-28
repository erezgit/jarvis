/**
 * @file Video Service Type Definitions
 * This file serves as the single source of truth for all video generation related types.
 */

import { EventEmitter } from 'events';
import { ErrorCode } from '../../../types/errors';
import { DbResult } from '../../../lib/db/types';
import { FileMetadata } from '../../../lib/storage/types';

// ============================================================================
// Core Status and State Types
// ============================================================================

/**
 * Status of a video generation request
 */
export enum GenerationStatus {
  PENDING = 'pending',     // Initial state when created
  QUEUED = 'queued',      // Added to generation queue
  PREPARING = 'preparing', // Preparing for generation
  GENERATING = 'generating', // Active generation
  PROCESSING = 'processing', // Post-generation processing
  COMPLETED = 'completed',   // Successfully completed
  FAILED = 'failed'         // Failed to generate
}

/**
 * Type guard for runtime validation of GenerationStatus
 */
export function isGenerationStatus(status: string): status is GenerationStatus {
  return Object.values(GenerationStatus).includes(status as GenerationStatus);
}

// ============================================================================
// Metadata Types
// ============================================================================

/**
 * Generation metadata structure
 */
export interface GenerationMetadata {
  thumbnailUrl: string | null;
  duration: number | null;
  error: string | null;
  model?: string;
  fps?: number;
  width?: number;
  height?: number;
  runwayJobId?: string;
  [key: string]: unknown;
}

/**
 * Base video metadata interface extending FileMetadata
 */
export interface BaseVideoMetadata extends FileMetadata {
  generationId: string;
  projectId: string;
  userId: string;
  type: 'video';
}

/**
 * Extended metadata with video-specific properties
 */
export interface VideoMetadata extends BaseVideoMetadata {
  duration?: number;
  dimensions?: {
    width: number;
    height: number;
  };
  frameRate?: number;
  codec?: string;
  bitrate?: number;
  format?: string;
  thumbnailUrl?: string;
}

/**
 * Type guard for video metadata
 */
export function isVideoMetadata(metadata: unknown): metadata is VideoMetadata {
  if (!metadata || typeof metadata !== 'object') return false;
  
  const base = metadata as BaseVideoMetadata;
  return (
    typeof base.generationId === 'string' &&
    typeof base.projectId === 'string' &&
    typeof base.userId === 'string' &&
    base.type === 'video' &&
    typeof base.mimeType === 'string' &&
    typeof base.contentType === 'string' &&
    typeof base.size === 'number'
  );
}

// ============================================================================
// Database Types
// ============================================================================

/**
 * Database representation of a video generation
 */
export interface DbGeneration {
  id: string;
  user_id: string;
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

/**
 * Database operation types for video generation
 */
export interface DbGenerationCreate {
  user_id: string;
  prompt: string;
  status: GenerationStatus;
  metadata: Record<string, unknown>; // Required field
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

// ============================================================================
// API Types
// ============================================================================

/**
 * Core generation type used across services
 */
export interface Generation {
  id: string;
  user_id: string;
  prompt: string;
  status: GenerationStatus;
  video_url?: string | null;
  error_message?: string | null;
  created_at: string;
  updated_at: string;
  metadata?: GenerationMetadata;
}

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

// ============================================================================
// Processing Types
// ============================================================================

export interface ProcessingResult {
  success: boolean;
  videoUrl?: string;
  error?: string;
  metadata?: VideoMetadata;
}

export interface ProcessingOptions {
  timeout: number;
  maxRetries?: number;
  maxSize?: number;
  allowedTypes?: string[];
}

export type ProcessingStage = 'download' | 'validation' | 'upload';

export interface ProcessingStatusUpdate {
  status: GenerationStatus;
  stage?: ProcessingStage;
  progress?: number;
  metadata?: Partial<VideoMetadata>;
  error?: string;
}

// ============================================================================
// Event Types
// ============================================================================

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

// ============================================================================
// Service Types
// ============================================================================

export interface StateHooks {
  beforeTransition?: (from: GenerationStatus, to: GenerationStatus) => Promise<void>;
  afterTransition?: (from: GenerationStatus, to: GenerationStatus) => Promise<void>;
  onError?: (error: Error, from: GenerationStatus, to: GenerationStatus) => Promise<void>;
}

export interface IVideoService {
  startGeneration(request: VideoGenerationRequest): Promise<VideoGenerationResult>;
  getGenerationStatus(generationId: string, userId: string): Promise<VideoGenerationStatus>;
  onStatusChange(listener: (event: StatusChangeEvent) => void): void;
  onError(listener: (event: ErrorEvent) => void): void;
  onCompleted(listener: (event: StatusChangeEvent) => void): void;
  onFailed(listener: (event: ErrorEvent) => void): void;
  updateGenerationStatus(
    generationId: string,
    newStatus: GenerationStatus,
    metadata?: Record<string, unknown>
  ): Promise<void>;
}

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

/**
 * Repository interface for video generation database operations
 */
export interface IVideoGenerationRepository {
  createGeneration(data: DbGenerationCreate): Promise<DbResult<DbGeneration>>;
  getGeneration(id: string): Promise<DbResult<DbGeneration>>;
  updateGeneration(id: string, updates: DbGenerationUpdate): Promise<DbResult<DbGeneration>>;
  deleteGeneration(id: string): Promise<DbResult<void>>;
  beginTransaction(): Promise<void>;
  checkConnection(): Promise<DbResult<void>>;
}

// ============================================================================
// Constants
// ============================================================================

export const DEFAULT_PROCESSING_OPTIONS: ProcessingOptions = {
  timeout: 30000,
  maxRetries: 3,
  maxSize: 104857600,
  allowedTypes: [
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo'
  ]
}; 