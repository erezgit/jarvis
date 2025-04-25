import { DbResult } from '../../../lib/db/types';
import { GenerationStatus, GenerationMetadata } from '../../video/types';

export interface DbProject {
  id: string;
  user_id: string;
  image_url: string;
  title: string | null;
  created_at: string;
  updated_at: string;
  generations?: DbProjectGeneration[] | null;
}

export interface DbProjectGeneration {
  id: string;
  project_id: string;
  user_id: string;
  status: GenerationStatus;
  video_url: string | null;
  prompt: string;
  error_message: string | null;
  model_id: string;
  duration: number;
  thumbnail_url: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  metadata: GenerationMetadata;
}

export interface IProjectRepository {
  getProjectDetails(projectId: string): Promise<DbResult<DbProject>>;
  getProject(projectId: string): Promise<DbResult<DbProject>>;
  getProjectsForUser(userId: string): Promise<DbResult<DbProject[]>>;
  getProjectVideos(projectId: string): Promise<DbResult<DbProjectGeneration[]>>;
  updateGeneration(generationId: string, updates: Partial<DbProjectGeneration>): Promise<DbResult<void>>;
  checkConnection(): Promise<DbResult<void>>;
}

export interface ProjectCreate {
  user_id: string;
  title: string;
  image_url?: string;
}

export interface ProjectUpdate {
  title?: string;
  image_url?: string;
  updated_at?: string;
} 