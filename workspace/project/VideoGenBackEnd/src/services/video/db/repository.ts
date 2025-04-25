import { injectable, inject } from 'tsyringe';
import { Logger } from 'winston';
import { TYPES } from '../../../lib/types';
import { BaseRepository } from '../../../lib/services/repository.base';
import { createServerSupabase } from '../../../lib/supabase';
import { DbResult } from '../../../lib/db/types';
import { DbGeneration, DbGenerationCreate, DbGenerationUpdate } from '../types';
import { IVideoGenerationRepository } from '../interfaces/video-generation.repository.interface';

@injectable()
export class VideoRepository extends BaseRepository implements IVideoGenerationRepository {
  constructor(
    @inject(TYPES.Logger) protected readonly logger: Logger
  ) {
    super(logger, 'VideoRepository');
  }

  /**
   * Create a new generation
   */
  async createGeneration(data: DbGenerationCreate): Promise<DbResult<DbGeneration>> {
    return this.executeQuery<DbGeneration>('createGeneration', async () => {
      const supabase = createServerSupabase();
      const { data: generation, error } = await supabase
        .from('generations')
        .insert({
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      if (!generation) throw new Error('Failed to create generation');

      return generation;
    });
  }

  /**
   * Get a generation by ID
   */
  async getGeneration(id: string): Promise<DbResult<DbGeneration>> {
    return this.executeQuery<DbGeneration>('getGeneration', async () => {
      const supabase = createServerSupabase();
      const { data: generation, error } = await supabase
        .from('generations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!generation) throw new Error(`Generation not found: ${id}`);

      return generation;
    });
  }

  /**
   * Update a generation
   */
  async updateGeneration(id: string, updates: DbGenerationUpdate): Promise<DbResult<DbGeneration>> {
    return this.executeQuery<DbGeneration>('updateGeneration', async () => {
      const supabase = createServerSupabase();
      const { data: generation, error } = await supabase
        .from('generations')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!generation) throw new Error(`Generation not found: ${id}`);

      return generation;
    });
  }

  /**
   * Delete a generation
   */
  async deleteGeneration(id: string): Promise<DbResult<void>> {
    return this.executeQuery<void>('deleteGeneration', async () => {
      const supabase = createServerSupabase();
      const { error } = await supabase
        .from('generations')
        .delete()
        .eq('id', id);

      if (error) throw error;
    });
  }

  /**
   * Begin a transaction
   * Note: Supabase doesn't support transactions directly
   */
  async beginTransaction(): Promise<void> {
    // Note: Supabase doesn't support transactions directly
    // This is a placeholder for future implementation
  }

  /**
   * Create multiple generations
   */
  async createGenerations(dataList: DbGenerationCreate[]): Promise<DbResult<DbGeneration[]>> {
    return this.executeQuery<DbGeneration[]>('createGenerations', async () => {
      const supabase = createServerSupabase();
      const now = new Date().toISOString();
      
      const generationsToCreate = dataList.map(data => ({
        ...data,
        created_at: now,
        updated_at: now
      }));

      const { data: generations, error } = await supabase
        .from('generations')
        .insert(generationsToCreate)
        .select();

      if (error) throw error;
      if (!generations) throw new Error('Failed to create generations');

      return generations;
    });
  }

  /**
   * Update multiple generations
   */
  async updateGenerations(
    updates: { id: string; data: DbGenerationUpdate }[]
  ): Promise<DbResult<void>> {
    return this.executeQuery<void>('updateGenerations', async () => {
      const supabase = createServerSupabase();
      const now = new Date().toISOString();

      for (const update of updates) {
        const { error } = await supabase
          .from('generations')
          .update({
            ...update.data,
            updated_at: now
          })
          .eq('id', update.id);

        if (error) throw error;
      }
    });
  }

  /**
   * Get generations by IDs
   */
  async getGenerationsByIds(generationIds: string[], userId: string): Promise<DbResult<DbGeneration[]>> {
    return this.executeQuery<DbGeneration[]>('getGenerationsByIds', async () => {
      const supabase = createServerSupabase();
      const { data: generations, error } = await supabase
        .from('generations')
        .select('*')
        .in('id', generationIds)
        .eq('user_id', userId);

      if (error) throw error;
      if (!generations) return [];

      return generations;
    });
  }

  /**
   * Update generation statuses
   */
  async updateGenerationStatuses(
    updates: { id: string; status: string; error_message?: string }[]
  ): Promise<DbResult<void>> {
    return this.executeQuery<void>('updateGenerationStatuses', async () => {
      const supabase = createServerSupabase();
      const now = new Date().toISOString();

      for (const update of updates) {
        const { error } = await supabase
          .from('generations')
          .update({
            status: update.status,
            error_message: update.error_message,
            updated_at: now
          })
          .eq('id', update.id);

        if (error) throw error;
      }
    });
  }

  /**
   * Check database connection
   */
  async checkConnection(): Promise<DbResult<void>> {
    return this.executeQuery<void>('checkConnection', async () => {
      const supabase = createServerSupabase();
      const { error } = await supabase
        .from('generations')
        .select('id')
        .limit(1);

      if (error) throw error;
    });
  }
} 