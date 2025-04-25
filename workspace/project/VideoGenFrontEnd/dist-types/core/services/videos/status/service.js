import { BaseService } from '../../base/BaseService';
/**
 * Service for checking video generation status
 * Implements the Video Status Endpoint (Service 2.2) as specified by the backend team
 */
export class VideoStatusService extends BaseService {
    constructor() {
        super();
        Object.defineProperty(this, "BASE_PATH", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: '/api/videos'
        });
    }
    static getInstance() {
        if (!VideoStatusService.instance) {
            VideoStatusService.instance = new VideoStatusService();
        }
        return VideoStatusService.instance;
    }
    /**
     * Log a message with optional data
     * @param message The message to log
     * @param data Optional data to include in the log
     */
    log(message, data) {
        console.log(`[VideoStatusService] ${message}`, data || '');
    }
    /**
     * Check the status of a video generation
     * @param generationId The ID of the generation to check
     * @returns A ServiceResult containing the video status or an error
     */
    async checkStatus(generationId) {
        this.log('checkStatus', { generationId });
        return this.handleRequest(() => this.api.get(`${this.BASE_PATH}/status/${generationId}`));
    }
    /**
     * Determine if a status is terminal (completed or failed)
     * @param status The status to check
     * @returns True if the status is terminal, false otherwise
     */
    isTerminalStatus(status) {
        return status === 'completed' || status === 'failed';
    }
}
