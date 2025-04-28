import type {
  Project,
  ProjectListItem,
  ProjectResponse,
  ProjectListResponse,
  CreateProjectInput,
  UpdateProjectInput,
  GenerationStatusResponse,
} from './types';
import { BaseService } from '@/core/services/base/BaseService';
import type { ServiceResult } from '@/core/types/service';
import type { ApiResponse, ApiError } from '@/core/types/api';
import { ProjectMapper } from './mappers';
import { videoService } from '@/core/services/videos';
import type { Video } from '@/core/services/videos';

/**
 * Service for managing projects
 * Follows the standard service pattern with proper error handling and response mapping
 */
export class ProjectService extends BaseService {
  private static instance: ProjectService;

  private constructor() {
    super();
    this.log('constructor', 'ProjectService initialized');
  }

  static getInstance(): ProjectService {
    if (!ProjectService.instance) {
      ProjectService.instance = new ProjectService();
    }
    return ProjectService.instance;
  }

  /**
   * Retrieves all projects for the current user
   * @returns ServiceResult containing array of ProjectListItem or error
   */
  async getAllProjects(): Promise<ServiceResult<ProjectListItem[]>> {
    this.log('getAllProjects', 'Fetching all projects');

    try {
      // Log the API client configuration
      this.log('getAllProjects', {
        apiClientType: 'unified',
        endpoint: 'projects?include=videos',
      }, 'debug');

      // Get all projects with their videos in a single call
      const response = await this.api.get<ApiResponse<any>>('projects?include=videos');

      if (this.isApiError(response)) {
        this.log('getAllProjects', { error: response.message }, 'error');
        return {
          data: null,
          error: new Error(response.message),
        };
      }

      // Log the raw response
      this.log('getAllProjects', { response: response.data }, 'debug');

      // Handle nested data structure
      const projectsData = Array.isArray(response.data.data) ? response.data.data : [];
      const mappedData = projectsData.map(ProjectMapper.toProjectList);

      // Log the mapped data
      this.log('getAllProjects', { mappedData }, 'debug');

      return {
        data: mappedData,
        error: null,
      };
    } catch (err) {
      this.log('getAllProjects', { error: err }, 'error');
      return {
        data: null,
        error: err instanceof Error ? err : new Error('Unknown error occurred'),
      };
    }
  }

  /**
   * Retrieves details for a specific project
   * @param id Project ID
   * @returns ServiceResult containing Project or error
   */
  async getProjectDetails(id: string): Promise<ServiceResult<Project>> {
    if (!id) {
      return {
        data: null,
        error: new Error('Project ID is required'),
      };
    }

    this.log('getProjectDetails', { id });

    try {
      // Log the API client configuration
      this.log('getProjectDetails', {
        apiClientType: 'unified',
        endpoint: `projects/${id}?include=videos,generations`,
      }, 'debug');

      // Get project with videos included in a single call
      const response = await this.api.get<ProjectResponse>(
        `projects/${id}?include=videos,generations`,
      );

      if (this.isApiError(response)) {
        this.log('getProjectDetails', { id, error: response.message }, 'error');
        return {
          data: null,
          error: new Error(response.message),
        };
      }

      // Log the raw response
      this.log('getProjectDetails', { response: response.data }, 'debug');

      // Handle nested data structure
      const projectData = response.data.data;
      const project = ProjectMapper.toProject(projectData);

      // Log the mapped data
      this.log('getProjectDetails', { project }, 'debug');

      return {
        data: project,
        error: null,
      };
    } catch (err) {
      this.log('getProjectDetails', { id, error: err }, 'error');
      return {
        data: null,
        error: err instanceof Error ? err : new Error('Unknown error occurred'),
      };
    }
  }

  /**
   * Creates a new project
   * @param data Project creation input
   * @returns ServiceResult containing created Project or error
   */
  async createProject(data: CreateProjectInput): Promise<ServiceResult<Project>> {
    if (!data.name) {
      return {
        data: null,
        error: new Error('Project name is required'),
      };
    }

    this.log('createProject', { input: data });

    try {
      const response = await this.api.post<ApiResponse<any>>('projects', data);
      if (this.isApiError(response)) {
        this.log('createProject', { error: response.message }, 'error');
        return {
          data: null,
          error: new Error(response.message),
        };
      }

      // Access the project data from the nested response structure
      const projectData = response.data.data;
      const project = ProjectMapper.toProject(projectData);
      this.log('createProject', { id: project.id, success: true });

      return {
        data: project,
        error: null,
      };
    } catch (err) {
      this.log('createProject', { error: err }, 'error');
      return {
        data: null,
        error: err instanceof Error ? err : new Error('Unknown error occurred'),
      };
    }
  }

  /**
   * Updates an existing project
   * @param id Project ID
   * @param data Project update input
   * @returns ServiceResult containing updated Project or error
   */
  async updateProject(id: string, data: UpdateProjectInput): Promise<ServiceResult<Project>> {
    if (!id) {
      return {
        data: null,
        error: new Error('Project ID is required'),
      };
    }

    this.log('updateProject', { id, input: data });

    try {
      // Single API call to update project with video associations
      const response = await this.api.put<ProjectResponse>(
        `projects/${id}?include=videos,generations`,
        data,
      );

      if (this.isApiError(response)) {
        this.log('updateProject', { id, error: response.message }, 'error');
        return {
          data: null,
          error: new Error(response.message),
        };
      }

      // Log the raw response
      this.log('updateProject', { response: response.data }, 'debug');

      // Handle nested data structure
      const projectData = response.data.data;
      const project = ProjectMapper.toProject(projectData);

      // Log the mapped data
      this.log('updateProject', { project }, 'debug');

      return {
        data: project,
        error: null,
      };
    } catch (err) {
      this.log('updateProject', { id, error: err }, 'error');
      return {
        data: null,
        error: err instanceof Error ? err : new Error('Unknown error occurred'),
      };
    }
  }

  /**
   * Deletes a project
   * @param id Project ID
   * @returns ServiceResult containing void or error
   */
  async deleteProject(id: string): Promise<ServiceResult<void>> {
    if (!id) {
      return {
        data: null,
        error: new Error('Project ID is required'),
      };
    }

    this.log('deleteProject', { id });

    try {
      // Single API call to delete project and handle video associations
      const response = await this.api.delete(`projects/${id}`);

      if (this.isApiError(response)) {
        this.log('deleteProject', { id, error: response.message }, 'error');
        return {
          data: null,
          error: new Error(response.message),
        };
      }

      this.log('deleteProject', { id, success: true });
      return {
        data: undefined,
        error: null,
      };
    } catch (err) {
      this.log('deleteProject', { id, error: err }, 'error');
      return {
        data: null,
        error: err instanceof Error ? err : new Error('Unknown error occurred'),
      };
    }
  }

  /**
   * Checks the status of a video generation within a project context
   * This method provides a clean domain boundary between project and video generation
   * @param projectId Project ID
   * @param generationId Generation ID
   * @returns ServiceResult containing generation status or error
   */
  async checkGenerationStatus(
    projectId: string,
    generationId: string,
  ): Promise<ServiceResult<GenerationStatusResponse>> {
    if (!projectId || !generationId) {
      return {
        data: null,
        error: new Error('Project ID and Generation ID are required'),
      };
    }

    this.log('checkGenerationStatus', { projectId, generationId });

    try {
      // First verify the generation belongs to this project
      const projectResult = await this.getProjectDetails(projectId);
      if (projectResult.error) {
        return {
          data: null,
          error: projectResult.error,
        };
      }

      const project = projectResult.data;
      if (!project?.generations?.some((g) => g.id === generationId)) {
        return {
          data: null,
          error: new Error('Generation not found in project'),
        };
      }

      // Get status from video service
      const result = await videoService.checkGenerationStatus(generationId);
      if (result.error) {
        this.log('checkGenerationStatus', { error: result.error }, 'error');
        return {
          data: null,
          error: result.error,
        };
      }

      // Map video service response to project domain
      const status: GenerationStatusResponse = {
        generationId: result.data!.generationId,
        status: result.data!.status,
        progress: result.data!.progress,
        error: result.data!.error,
      };

      this.log('checkGenerationStatus', { status }, 'debug');

      return {
        data: status,
        error: null,
      };
    } catch (err) {
      this.log('checkGenerationStatus', { error: err }, 'error');
      return {
        data: null,
        error: err instanceof Error ? err : new Error('Unknown error occurred'),
      };
    }
  }

  /**
   * Associates a generated video with a project
   * @param projectId Project ID
   * @param videoId Video ID
   * @returns ServiceResult containing void or error
   */
  async associateVideo(projectId: string, videoId: string): Promise<ServiceResult<void>> {
    if (!projectId || !videoId) {
      return {
        data: null,
        error: new Error('Project ID and Video ID are required'),
      };
    }

    this.log('associateVideo', { projectId, videoId });

    try {
      // First verify the video exists
      const videoResult = await videoService.getVideo(videoId);
      if (videoResult.error) {
        return {
          data: null,
          error: videoResult.error,
        };
      }

      // Update project with new video association
      const updateResult = await this.updateProject(projectId, {
        videoIds: [...(await this.getProjectDetails(projectId)).data!.videoIds, videoId],
      });

      if (updateResult.error) {
        return {
          data: null,
          error: updateResult.error,
        };
      }

      return {
        data: null,
        error: null,
      };
    } catch (err) {
      this.log('associateVideo', { error: err }, 'error');
      return {
        data: null,
        error: err instanceof Error ? err : new Error('Unknown error occurred'),
      };
    }
  }
}

export const projectService = ProjectService.getInstance();
