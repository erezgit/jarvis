import { Logger } from 'winston';
import { AppError } from '../../errors/base';

export interface ServiceOptions {
  logger: Logger;
  serviceName: string;
}

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: AppError;
}

export interface BaseRepository {
  logger: Logger;
  dbName: string;
} 