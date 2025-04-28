import { ServiceError } from '@/core/services/base/errors';
export class ImageServiceError extends ServiceError {
    constructor(message, code) {
        super(message, code);
        this.name = 'ImageServiceError';
    }
}
