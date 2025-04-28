import { ServiceError } from '../base/errors';
export class VideoServiceError extends ServiceError {
    constructor(message, code) {
        super(message, code);
        this.name = 'VideoServiceError';
    }
}
