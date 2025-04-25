import { Logger } from 'winston';
import { DbResult } from '../db/types';

export abstract class BaseRepository {
  constructor(
    protected readonly logger: Logger,
    protected readonly dbName: string
  ) {}

  protected async executeQuery<T>(
    operation: string,
    queryFn: () => Promise<T>
  ): Promise<DbResult<T>> {
    try {
      const result = await queryFn();
      return { data: result, error: null };
    } catch (error) {
      this.logger.error(`[${this.dbName}] ${operation} failed`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      return { data: null, error: error as Error };
    }
  }
} 