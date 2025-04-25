import { UserRole } from '../../types/auth';
import { GenerationStatus, GenerationMetadata } from '../video/types';
import { ServiceResult } from '../../types';

/**
 * Project list item for API responses
 * Simplified version of Project for list views
 */
export interface ProjectListItem {
  id: string;
  imageUrl: string;
  prompt: string;  // From first generation's prompt
  videos: {
    id: string;
    url: string;
  }[];
}

export { GenerationMetadata };

/**
 * Full project representation for API responses
 */
export interface Project {
  id: string;
  userId: string;
  imageUrl: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  generations?: Generation[];
}

/**
 * Generation information for API responses
 */
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

/**
 * Project state information
 * Used for tracking overall project progress and status
 */
export interface ProjectState {
  status: GenerationStatus;
  lastModified: string;
  generationCount: number;
  completedGenerations: number;
  failedGenerations: number;
  activeGenerations: number;
}

/**
 * Video list response for API
 */
export interface VideoListResponse {
  id: string;
  videoUrl: string | null;
  status: GenerationStatus;
  prompt: string;
  createdAt: string;
  metadata: GenerationMetadata;
}

/**
 * Project service interface
 * Defines all operations available for project management
 */
export interface IProjectService {
  /**
   * Get all projects for a specific user
   * @param userId - The ID of the user
   * @returns List of projects with their basic information
   */
  getProjectsForUser(userId: string): Promise<ServiceResult<Project[]>>;

  /**
   * Get detailed information for a specific project
   * @param projectId - The ID of the project
   * @param userId - The ID of the requesting user
   * @param userRole - The role of the requesting user
   * @returns Detailed project information
   */
  getProject(projectId: string, userId: string, userRole: UserRole): Promise<ServiceResult<Project>>;

  /**
   * Check database connection health
   * @returns Void if successful, error if connection fails
   */
  checkDatabaseConnection(): Promise<ServiceResult<void>>;

  /**
   * Update the state of a project
   * @param projectId - The ID of the project
   * @param userId - The ID of the requesting user
   * @param userRole - The role of the requesting user
   * @param updates - The state updates to apply
   * @returns Updated project information
   */
  updateProjectState(
    projectId: string,
    userId: string,
    userRole: UserRole,
    updates: Partial<ProjectState>
  ): Promise<ServiceResult<Project>>;

  /**
   * Get the current state of a project
   * @param projectId - The ID of the project
   * @param userId - The ID of the requesting user
   * @param userRole - The role of the requesting user
   * @returns Current project state
   */
  getProjectState(
    projectId: string,
    userId: string,
    userRole: UserRole
  ): Promise<ServiceResult<ProjectState>>;

  /**
   * Handle state changes for a generation
   * @param projectId - The ID of the project
   * @param generationId - The ID of the generation
   * @param newStatus - The new status to set
   * @param metadata - Optional metadata to update
   * @returns Void if successful
   */
  handleGenerationStateChange(
    projectId: string,
    generationId: string,
    newStatus: GenerationStatus,
    metadata?: Record<string, unknown>
  ): Promise<ServiceResult<void>>;

  /**
   * Get all videos for a specific project
   * @param projectId - The ID of the project
   * @param userId - The ID of the requesting user
   * @param userRole - The role of the requesting user
   * @returns List of project videos
   */
  getProjectVideos(
    projectId: string,
    userId: string,
    userRole: UserRole
  ): Promise<ServiceResult<VideoListResponse[]>>;
} 