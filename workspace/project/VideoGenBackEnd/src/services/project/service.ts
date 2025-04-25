import { injectable, inject } from 'tsyringe';
import { Logger } from 'winston';
import { TYPES } from '../../lib/types';
import { BaseService } from '../../lib/services/base.service';
import { ServiceResult } from '../../types';
import { UserRole } from '../../types/auth';
import { ProjectRepository } from './db/repository';
import { 
  Project, 
  Generation, 
  ProjectState,
  VideoListResponse,
  IProjectService 
} from './types';
import { GenerationStatus, GenerationMetadata } from '../video/types';
import { 
  ProjectError, 
  ProjectNotFoundError, 
  ProjectAccessError,
  ProjectValidationError 
} from './errors';
import { DbProject, DbProjectGeneration } from './db/types';

@injectable()
export class ProjectService extends BaseService {
  constructor(
    @inject(TYPES.Logger) protected readonly logger: Logger,
    @inject(TYPES.ProjectRepository) private readonly repository: ProjectRepository
  ) {
    super(logger, 'ProjectService');
  }

  private mapDbGenerationToGeneration(dbGeneration: DbProjectGeneration): Generation {
    return {
      id: dbGeneration.id,
      projectId: dbGeneration.project_id,
      userId: dbGeneration.user_id,
      prompt: dbGeneration.prompt,
      status: dbGeneration.status,
      videoUrl: dbGeneration.video_url,
      errorMessage: dbGeneration.error_message,
      createdAt: dbGeneration.created_at,
      updatedAt: dbGeneration.updated_at,
      startedAt: dbGeneration.started_at,
      completedAt: dbGeneration.completed_at,
      metadata: dbGeneration.metadata as GenerationMetadata,
      modelId: dbGeneration.model_id,
      duration: dbGeneration.duration,
      thumbnailUrl: dbGeneration.thumbnail_url
    };
  }

  private mapDbProjectToProject(dbProject: DbProject): Project {
    return {
      id: dbProject.id,
      userId: dbProject.user_id,
      imageUrl: dbProject.image_url,
      title: dbProject.title || '',
      createdAt: dbProject.created_at,
      updatedAt: dbProject.updated_at,
      generations: dbProject.generations?.map(gen => this.mapDbGenerationToGeneration(gen)) || []
    };
  }

  async getProjectsForUser(userId: string): Promise<ServiceResult<Project[]>> {
    try {
      const result = await this.repository.getProjectsForUser(userId);
      if (result.error) {
        throw result.error;
      }
      return {
        success: true,
        data: result.data?.map(project => this.mapDbProjectToProject(project)) || []
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getProjectVideos(projectId: string): Promise<ServiceResult<VideoListResponse[]>> {
    try {
      const result = await this.repository.getProjectVideos(projectId);
      if (result.error) {
        throw result.error;
      }
      return {
        success: true,
        data: result.data?.map(gen => ({
          id: gen.id,
          videoUrl: gen.video_url,
          status: gen.status,
          prompt: gen.prompt,
          createdAt: gen.created_at,
          metadata: {
            thumbnailUrl: gen.thumbnail_url,
            duration: gen.duration,
            error: gen.error_message,
            ...gen.metadata
          } as GenerationMetadata
        })) || []
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async checkDatabaseConnection(): Promise<ServiceResult<void>> {
    try {
      const result = await this.repository.checkConnection();
      if (result.error) {
        throw result.error;
      }
      return { success: true };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateGeneration(
    generationId: string,
    updates: Partial<Generation>
  ): Promise<ServiceResult<void>> {
    try {
      const result = await this.repository.updateGeneration(generationId, {
        status: updates.status,
        video_url: updates.videoUrl,
        error_message: updates.errorMessage,
        metadata: updates.metadata as Record<string, unknown>
      });
      if (result.error) {
        throw result.error;
      }
      return { success: true };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getProject(projectId: string, userId: string, userRole: UserRole): Promise<ServiceResult<Project>> {
    try {
      const result = await this.repository.getProject(projectId);
      if (result.error) {
        throw result.error;
      }
      if (!result.data) {
        throw new ProjectNotFoundError(projectId);
      }
      if (result.data.user_id !== userId && userRole !== UserRole.ADMIN) {
        throw new ProjectAccessError(projectId, userId);
      }
      return {
        success: true,
        data: this.mapDbProjectToProject(result.data)
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getProjectState(projectId: string, userId: string, userRole: UserRole): Promise<ServiceResult<ProjectState>> {
    try {
      const projectResult = await this.repository.getProject(projectId);
      if (projectResult.error) {
        throw projectResult.error;
      }
      if (!projectResult.data) {
        throw new ProjectNotFoundError(projectId);
      }
      if (projectResult.data.user_id !== userId && userRole !== UserRole.ADMIN) {
        throw new ProjectAccessError(projectId, userId);
      }

      const generations = projectResult.data.generations || [];
      const state: ProjectState = {
        status: this.calculateProjectStatus(generations),
        lastModified: projectResult.data.updated_at,
        generationCount: generations.length,
        completedGenerations: generations.filter(g => g.status === GenerationStatus.COMPLETED).length,
        failedGenerations: generations.filter(g => g.status === GenerationStatus.FAILED).length,
        activeGenerations: generations.filter(g => 
          g.status === GenerationStatus.GENERATING || 
          g.status === GenerationStatus.PROCESSING
        ).length
      };

      return {
        success: true,
        data: state
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateProjectState(
    projectId: string, 
    userId: string, 
    userRole: UserRole,
    updates: Partial<ProjectState>
  ): Promise<ServiceResult<Project>> {
    try {
      const projectResult = await this.repository.getProject(projectId);
      if (projectResult.error) {
        throw projectResult.error;
      }
      if (!projectResult.data) {
        throw new ProjectNotFoundError(projectId);
      }
      if (projectResult.data.user_id !== userId && userRole !== UserRole.ADMIN) {
        throw new ProjectAccessError(projectId, userId);
      }

      // Update project state logic here
      return {
        success: true,
        data: this.mapDbProjectToProject(projectResult.data)
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  private calculateProjectStatus(generations: DbProjectGeneration[]): GenerationStatus {
    if (generations.length === 0) return GenerationStatus.QUEUED;
    if (generations.some(g => g.status === GenerationStatus.GENERATING)) return GenerationStatus.GENERATING;
    if (generations.some(g => g.status === GenerationStatus.PROCESSING)) return GenerationStatus.PROCESSING;
    if (generations.every(g => g.status === GenerationStatus.COMPLETED)) return GenerationStatus.COMPLETED;
    if (generations.every(g => g.status === GenerationStatus.FAILED)) return GenerationStatus.FAILED;
    return GenerationStatus.QUEUED;
  }

  /**
   * Get a single project by ID with all its details including generations
   */
  async getProjectDetails(projectId: string): Promise<ServiceResult<Project>> {
    try {
      const result = await this.repository.getProjectDetails(projectId);
      if (result.error) {
        throw result.error;
      }
      if (!result.data) {
        throw new ProjectNotFoundError(projectId);
      }
      return {
        success: true,
        data: this.mapDbProjectToProject(result.data)
      };
    } catch (error) {
      return this.handleError(error);
    }
  }
} 