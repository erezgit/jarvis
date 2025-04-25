import { ServiceError } from '../base/errors';
import type { ServiceErrorCode } from '../base/types';

export class VideoServiceError extends ServiceError {
  constructor(message: string, code: ServiceErrorCode) {
    super(message, code);
    this.name = 'VideoServiceError';
  }
}
