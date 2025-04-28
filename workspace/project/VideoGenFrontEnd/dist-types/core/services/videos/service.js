import { BaseService } from '@/core/services/base/BaseService';
export class VideoService extends BaseService {
    constructor() {
        super();
        this.log('constructor', 'VideoService initialized');
    }
    static getInstance() {
        if (!VideoService.instance) {
            VideoService.instance = new VideoService();
        }
        return VideoService.instance;
    }
    // Core video operations
    async getVideo(videoId) {
        this.log('getVideo', { videoId });
        return this.handleRequest(() => this.api.get(`/api/videos/${videoId}`)).then((result) => ({
            data: result.data?.data || null,
            error: result.error,
        }));
    }
    async getVideos(options) {
        this.log('getVideos', { options });
        const endpoint = options?.projectId
            ? `/api/videos/project/${options.projectId}`
            : '/api/videos';
        return this.handleRequest(() => this.api.get(endpoint)).then((result) => ({
            data: result.data?.data || null,
            error: result.error,
        }));
    }
    async updateVideo(videoId, input) {
        this.log('updateVideo', { videoId, input });
        return this.handleRequest(() => this.api.put(`/api/videos/${videoId}`, input)).then((result) => ({
            data: result.data?.data || null,
            error: result.error,
        }));
    }
    // Video generation operations
    async generateVideo(options) {
        this.log('generateVideo', {
            projectId: options.projectId,
            prompt: options.prompt,
            hasImageUrl: !!options.imageUrl,
        });
        return this.handleRequest(() => this.api.post('/api/videos/generate', options));
    }
    async checkGenerationStatus(generationId) {
        this.log('checkGenerationStatus', { generationId });
        return this.handleRequest(() => this.api.get(`/api/videos/generation/${generationId}/status`));
    }
    async getGenerationResult(generationId) {
        this.log('getGenerationResult', { generationId });
        return this.handleRequest(() => this.api.get(`/api/videos/generation/${generationId}`));
    }
    // Project-Video relationship operations
    async getProjectVideos(projectId) {
        this.log('getProjectVideos', { projectId });
        return this.handleRequest(() => this.api.get(`/api/videos/project/${projectId}`));
    }
    async associateVideoWithProject(videoId, projectId) {
        this.log('associateVideoWithProject', { videoId, projectId });
        return this.handleRequest(() => this.api.post(`/api/videos/${videoId}/project/${projectId}`, {}));
    }
    async removeVideoFromProject(videoId, projectId) {
        this.log('removeVideoFromProject', { videoId, projectId });
        return this.handleRequest(() => this.api.delete(`/api/videos/${videoId}/project/${projectId}`));
    }
}
export const videoService = VideoService.getInstance();
