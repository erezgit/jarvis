import { GenerationStatus, GenerationMetadata } from '../types';

/**
 * Database operation result
 */
export interface DbResult<T> {
  data: T | null;
  error: Error | null;
}

/**
 * Generation creation parameters
 */
export interface DbGenerationCreate {
  user_id: string;
  project_id: string;
  prompt: string;
  status: GenerationStatus;
  metadata: Record<string, unknown>;
}

/**
 * Generation update parameters
 */
export interface DbGenerationUpdate {
  status?: GenerationStatus;
  video_url?: string;
  error_message?: string;
  started_at?: string;
  completed_at?: string;
  updated_at?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Video generation database interface
 */
export interface IVideoGenerationRepository {
  createGeneration(data: DbGenerationCreate): Promise<DbResult<DbGeneration>>;
  getGeneration(id: string): Promise<DbResult<DbGeneration>>;
  updateGeneration(id: string, data: Partial<DbGeneration>): Promise<DbResult<DbGeneration>>;
  deleteGeneration(id: string): Promise<DbResult<void>>;
}

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