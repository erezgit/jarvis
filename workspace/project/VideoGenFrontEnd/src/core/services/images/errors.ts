import { ServiceError } from '@/core/services/base/errors';
import type { ServiceErrorCode } from '@/core/services/base/types';

export class ImageServiceError extends ServiceError {
  constructor(message: string, code: ServiceErrorCode) {
    super(message, code);
    this.name = 'ImageServiceError';
  }
}
