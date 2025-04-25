import { DbResult } from '../../../lib/db/types';
import { DbGeneration, DbGenerationCreate, DbGenerationUpdate } from '../db/types';

export interface IVideoGenerationRepository {
  createGeneration(data: DbGenerationCreate): Promise<DbResult<DbGeneration>>;
  getGeneration(id: string): Promise<DbResult<DbGeneration>>;
  updateGeneration(id: string, updates: DbGenerationUpdate): Promise<DbResult<DbGeneration>>;
  deleteGeneration(id: string): Promise<DbResult<void>>;
  beginTransaction(): Promise<void>;
  checkConnection(): Promise<DbResult<void>>;
} 