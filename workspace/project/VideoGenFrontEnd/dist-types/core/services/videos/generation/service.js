import { BaseService } from '@/core/services/base/BaseService';
import { VideoGenerationMapper } from './mapper';
/**
 * Service responsible for handling video generation operations
 * Follows the singleton pattern and extends BaseService
 */
export class VideoGenerationService extends BaseService {
    constructor() {
        super();
        this.log('constructor', 'VideoGenerationService initialized');
    }
    /**
     * Gets the singleton instance of VideoGenerationService
     */
    static getInstance() {
        if (!VideoGenerationService.instance) {
            VideoGenerationService.instance = new VideoGenerationService();
        }
        return VideoGenerationService.instance;
    }
    /**
     * Initiates a video generation process
     * @param input Video generation parameters
     */
    async generateVideo(input) {
        this.log('generateVideo', {
            prompt: input.prompt,
            projectId: input.projectId,
            hasImage: !!input.metadata?.imageUrl,
            imageUrlLength: input.metadata?.imageUrl ? input.metadata.imageUrl.length : 0,
        });
        try {
            // Input validation
            if (!input.metadata?.imageUrl) {
                this.log('generateVideo', { error: 'Image URL is required' }, 'error');
                return {
                    data: null,
                    error: new Error('Image URL is required'),
                };
            }
            if (!input.prompt) {
                this.log('generateVideo', { error: 'Prompt is required' }, 'error');
                return {
                    data: null,
                    error: new Error('Prompt is required'),
                };
            }
            if (!input.projectId) {
                this.log('generateVideo', { error: 'Project ID is required' }, 'error');
                return {
                    data: null,
                    error: new Error('Project ID is required'),
                };
            }
            // Make API request
            this.log('generateVideo', { requestPayload: JSON.stringify(input) }, 'debug');
            const response = await this.api.post('/api/videos/generate', input);
            // Handle API error
            if (this.isApiError(response)) {
                this.log('generateVideo', {
                    error: response.message,
                    status: response.status,
                    code: response.code,
                    details: JSON.stringify(response),
                }, 'error');
                return {
                    data: null,
                    error: VideoGenerationMapper.toError(response),
                };
            }
            // Map successful response
            const result = VideoGenerationMapper.toResponse(response.data);
            this.log('generateVideo', {
                result,
                generationId: result.generationId,
                status: result.status,
            }, 'debug');
            return {
                data: result,
                error: null,
            };
        }
        catch (error) {
            this.log('generateVideo', {
                error,
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
                errorName: error instanceof Error ? error.name : 'Unknown',
                errorStack: error instanceof Error ? error.stack : undefined,
            }, 'error');
            return {
                data: null,
                error: VideoGenerationMapper.toError(error),
            };
        }
    }
    /**
     * Checks the progress of a video generation
     * @param generationId ID of the generation to check
     */
    async checkProgress(generationId) {
        this.log('checkProgress', { generationId });
        try {
            if (!generationId) {
                this.log('checkProgress', { error: 'Generation ID is required' });
                return {
                    data: null,
                    error: new Error('Generation ID is required'),
                };
            }
            const response = await this.api.get(`/api/videos/status/${generationId}`);
            // Log API response
            if (this.isApiError(response)) {
                this.log('checkProgress', {
                    message: 'Received API error response',
                    error: response.message,
                    status: response.status,
                    code: response.code,
                    generationId,
                });
                return {
                    data: null,
                    error: VideoGenerationMapper.toError(response),
                };
            }
            this.log('checkProgress', {
                message: 'Received API success response',
                hasData: !!response.data,
            });
            const progress = VideoGenerationMapper.toProgress(response.data);
            this.log('checkProgress', {
                progress,
                generationId,
                status: progress.status,
                progressValue: progress.progress,
            });
            return {
                data: progress,
                error: null,
            };
        }
        catch (error) {
            this.log('checkProgress', {
                error,
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
                errorName: error instanceof Error ? error.name : 'Unknown',
                errorStack: error instanceof Error ? error.stack : undefined,
                generationId,
            });
            return {
                data: null,
                error: VideoGenerationMapper.toError(error),
            };
        }
    }
    /**
     * Gets the final result of a video generation
     * @param generationId ID of the generation to get results for
     */
    async getResult(generationId) {
        this.log('getResult', { generationId });
        try {
            if (!generationId) {
                this.log('getResult', { error: 'Generation ID is required' }, 'error');
                return {
                    data: null,
                    error: new Error('Generation ID is required'),
                };
            }
            const response = await this.api.get(`/api/videos/status/${generationId}/result`);
            if (this.isApiError(response)) {
                this.log('getResult', {
                    error: response.message,
                    status: response.status,
                    code: response.code,
                    generationId,
                }, 'error');
                return {
                    data: null,
                    error: VideoGenerationMapper.toError(response),
                };
            }
            const result = VideoGenerationMapper.toResult(response.data);
            this.log('getResult', {
                result,
                generationId,
                status: result.status,
                hasVideo: !!result.videoUrl,
            }, 'debug');
            return {
                data: result,
                error: null,
            };
        }
        catch (error) {
            this.log('getResult', {
                error,
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
                errorName: error instanceof Error ? error.name : 'Unknown',
                errorStack: error instanceof Error ? error.stack : undefined,
                generationId,
            }, 'error');
            return {
                data: null,
                error: VideoGenerationMapper.toError(error),
            };
        }
    }
}
// Export singleton instance
export const videoGenerationService = VideoGenerationService.getInstance();
