import { Logger } from 'winston';
import { ServiceResult } from '../../types';
import { AppError } from '../../errors/base';

export abstract class BaseService {
  constructor(
    protected readonly logger: Logger,
    protected readonly serviceName: string
  ) {}

  protected handleError(error: unknown): ServiceResult<never> {
    const standardError = this.normalizeError(error);
    this.logger.info(`[${this.serviceName}] Operation failed`, {
      error: standardError.toLog(),
      timestamp: new Date().toISOString()
    });
    return {
      success: false,
      error: standardError
    };
  }

  protected logInfo(message: string, data?: Record<string, unknown>): void {
    this.logger.info(`[${this.serviceName}] ${message}`, {
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  protected logError(message: string, error: unknown): void {
    this.logger.error(`[${this.serviceName}] ${message}`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
  }

  private normalizeError(error: unknown): AppError {
    if (error instanceof AppError) {
      return error;
    }
    return AppError.server(
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
} 