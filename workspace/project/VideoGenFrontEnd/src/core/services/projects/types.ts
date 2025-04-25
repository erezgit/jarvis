import type { Video } from '@/core/services/videos';

// Project service type definitions

// Status type
export type ProjectStatus = 'draft' | 'active' | 'archived';

// Generation types
export type GenerationStatus =
  | 'queued'
  | 'preparing'
  | 'generating'
  | 'processing'
  | 'completed'
  | 'failed';

export interface Generation {
  id: string;
  videoUrl: string | null;
  status: GenerationStatus;
  prompt: string;
  createdAt: string;
  metadata?: {
    thumbnailUrl?: string;
    duration?: number;
    error?: string;
  };
}

// Base project type
export interface Project {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  prompt?: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  videoIds: string[]; // References to associated videos
  videos?: Video[]; // Optional array of actual video objects
  generations?: Generation[];
}

// List item type
export interface ProjectListItem
  extends Pick<Project, 'id' | 'name' | 'imageUrl' | 'prompt' | 'createdAt'> {
  videoCount: number; // Number of associated videos
  videos?: Video[]; // Optional array of video objects
}

// API response types
export interface ProjectListResponse {
  data: ProjectListItem[];
  total: number;
}

export interface ProjectResponse {
  data: Project;
}

// Input types
export interface CreateProjectInput {
  name: string;
  description?: string;
  imageUrl?: string;
  prompt?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  prompt?: string;
  videoIds?: string[]; // Allow updating video associations
}

// Generation status response type
export interface GenerationStatusResponse {
  generationId: string;
  status: GenerationStatus;
  progress?: number;
  error?: string;
  metadata?: {
    thumbnailUrl?: string;
    duration?: number;
  };
}
