import { UserRole } from './auth';
import { ServiceResult } from './index';
import { GenerationStatus, GenerationMetadata } from '../services/video/types';

// Project Types
export interface Project {
  id: string;
  userId: string;
  imageUrl: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  generations?: Generation[];
}

export interface Generation {
  id: string;
  projectId: string;
  userId: string;
  prompt: string;
  status: GenerationStatus;
  videoUrl: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
  startedAt: string | null;
  completedAt: string | null;
  metadata: GenerationMetadata;
  modelId: string;
  duration: number;
  thumbnailUrl: string | null;
}

export interface ProjectState {
  loading: boolean;
  error: string | null;
  data: Project | null;
}

export interface ProjectListItem {
  id: string;
  imageUrl: string;
  prompt: string;  // This comes from the first generation's prompt
  videos: {
    id: string;
    url: string;
  }[];
}

export interface IProjectService {
  getProjectsForUser(userId: string): Promise<ServiceResult<ProjectListItem[]>>;
  getProject(projectId: string, userId: string, userRole: UserRole): Promise<ServiceResult<Project>>;
  checkDatabaseConnection(): Promise<ServiceResult<void>>;
  updateProjectState(
    projectId: string,
    userId: string,
    userRole: UserRole,
    updates: Partial<ProjectState>
  ): Promise<ServiceResult<Project>>;
  getProjectState(
    projectId: string,
    userId: string,
    userRole: UserRole
  ): Promise<ServiceResult<ProjectState>>;
  handleGenerationStateChange(
    projectId: string,
    generationId: string,
    newStatus: GenerationStatus,
    metadata?: Record<string, unknown>
  ): Promise<ServiceResult<void>>;
}

// Video Generation Types - Using base types from video service
export type VideoGenerationResult = {
  success: boolean;
  generationId?: string;
  error?: string;
}

export type VideoGenerationStatus = {
  status: GenerationStatus;
  videoUrl?: string | null;
  error?: string | null;
  metadata: GenerationMetadata;
} 