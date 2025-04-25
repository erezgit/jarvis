import type { ServiceErrorCode } from './types';

export class ServiceError extends Error {
  constructor(
    message: string,
    public code: ServiceErrorCode,
    public details?: unknown,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}
