import { BaseService } from '@/core/services/base/BaseService';
import type { ServiceResult } from '@/core/types/service';
import type {
  Video,
  VideoGenerationResponse,
  VideoGenerationResult,
  VideoGenerationOptions,
  VideoStatusResponse,
  VideoResponse,
  VideoListResponse,
  CreateVideoInput as _CreateVideoInput,
  UpdateVideoInput,
  ProjectVideos,
} from './types';

export class VideoService extends BaseService {
  private static instance: VideoService;

  private constructor() {
    super();
    this.log('constructor', 'VideoService initialized');
  }

  public static getInstance(): VideoService {
    if (!VideoService.instance) {
      VideoService.instance = new VideoService();
    }
    return VideoService.instance;
  }

  // Core video operations
  async getVideo(videoId: string): Promise<ServiceResult<Video>> {
    this.log('getVideo', { videoId });

    return this.handleRequest<VideoResponse>(() => this.api.get(`/api/videos/${videoId}`)).then(
      (result) => ({
        data: result.data?.data || null,
        error: result.error,
      }),
    );
  }

  async getVideos(options?: { projectId?: string }): Promise<ServiceResult<Video[]>> {
    this.log('getVideos', { options });

    const endpoint = options?.projectId
      ? `/api/videos/project/${options.projectId}`
      : '/api/videos';

    return this.handleRequest<VideoListResponse>(() => this.api.get(endpoint)).then((result) => ({
      data: result.data?.data || null,
      error: result.error,
    }));
  }

  async updateVideo(videoId: string, input: UpdateVideoInput): Promise<ServiceResult<Video>> {
    this.log('updateVideo', { videoId, input });

    return this.handleRequest<VideoResponse>(() =>
      this.api.put(`/api/videos/${videoId}`, input),
    ).then((result) => ({
      data: result.data?.data || null,
      error: result.error,
    }));
  }

  // Video generation operations
  async generateVideo(
    options: VideoGenerationOptions,
  ): Promise<ServiceResult<VideoGenerationResponse>> {
    this.log('generateVideo', {
      projectId: options.projectId,
      prompt: options.prompt,
      hasImageUrl: !!options.imageUrl,
    });

    return this.handleRequest<VideoGenerationResponse>(() =>
      this.api.post('/api/videos/generate', options),
    );
  }

  async checkGenerationStatus(generationId: string): Promise<ServiceResult<VideoStatusResponse>> {
    this.log('checkGenerationStatus', { generationId });

    return this.handleRequest<VideoStatusResponse>(() =>
      this.api.get(`/api/videos/generation/${generationId}/status`),
    );
  }

  async getGenerationResult(generationId: string): Promise<ServiceResult<VideoGenerationResult>> {
    this.log('getGenerationResult', { generationId });

    return this.handleRequest<VideoGenerationResult>(() =>
      this.api.get(`/api/videos/generation/${generationId}`),
    );
  }

  // Project-Video relationship operations
  async getProjectVideos(projectId: string): Promise<ServiceResult<ProjectVideos>> {
    this.log('getProjectVideos', { projectId });

    return this.handleRequest<ProjectVideos>(() =>
      this.api.get(`/api/videos/project/${projectId}`),
    );
  }

  async associateVideoWithProject(
    videoId: string,
    projectId: string,
  ): Promise<ServiceResult<void>> {
    this.log('associateVideoWithProject', { videoId, projectId });

    return this.handleRequest<void>(() =>
      this.api.post(`/api/videos/${videoId}/project/${projectId}`, {}),
    );
  }

  async removeVideoFromProject(videoId: string, projectId: string): Promise<ServiceResult<void>> {
    this.log('removeVideoFromProject', { videoId, projectId });

    return this.handleRequest<void>(() =>
      this.api.delete(`/api/videos/${videoId}/project/${projectId}`),
    );
  }
}

export const videoService = VideoService.getInstance();
