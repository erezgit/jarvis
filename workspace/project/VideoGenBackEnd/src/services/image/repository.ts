import { injectable, inject } from 'tsyringe';
import { Logger } from 'winston';
import { BaseRepository } from '../../lib/services/repository.base';
import { createServerSupabase } from '../../lib/supabase';
import { TYPES } from '../../lib/types';
import { DbResult } from '../../lib/db/types';
import { ImageError, ImageNotFoundError } from './errors';
import { DbImage, DbImageCreate, DbImageUpdate, ImageErrorCode } from './types';

@injectable()
export class ImageRepository extends BaseRepository {
  constructor(
    @inject(TYPES.Logger) protected readonly logger: Logger
  ) {
    super(logger, 'ImageRepository');
  }

  /**
   * Create a new image record
   */
  async createImage(data: DbImageCreate): Promise<DbResult<DbImage>> {
    return this.executeQuery<DbImage>('createImage', async () => {
      const supabase = createServerSupabase();
      
      // Insert a new project record
      const { data: image, error } = await supabase
        .from('projects')
        .insert({
          id: data.project_id,
          user_id: data.user_id,
          image_url: data.image_url,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw new ImageError(ImageErrorCode.STORAGE_ERROR, error.message);
      if (!image) throw new ImageError(ImageErrorCode.STORAGE_ERROR, 'Failed to create image record');

      return {
        id: image.id,
        project_id: image.id,
        user_id: image.user_id,
        image_url: image.image_url,
        title: image.title || null,
        created_at: image.created_at,
        updated_at: image.updated_at
      };
    });
  }

  /**
   * Get an image by project ID
   */
  async getImageByProjectId(projectId: string, userId: string): Promise<DbResult<DbImage>> {
    return this.executeQuery<DbImage>('getImageByProjectId', async () => {
      const supabase = createServerSupabase();
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', userId)
        .single();

      if (error) throw new ImageError(ImageErrorCode.STORAGE_ERROR, error.message);
      if (!data) throw new ImageNotFoundError(`Image not found for project: ${projectId}`);

      return {
        id: data.id,
        project_id: data.id,
        user_id: data.user_id,
        image_url: data.image_url,
        title: data.title,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    });
  }

  /**
   * Update an image record
   */
  async updateImage(projectId: string, userId: string, data: DbImageUpdate): Promise<DbResult<DbImage>> {
    return this.executeQuery<DbImage>('updateImage', async () => {
      const supabase = createServerSupabase();
      const { data: image, error } = await supabase
        .from('projects')
        .update({
          image_url: data.image_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw new ImageError(ImageErrorCode.STORAGE_ERROR, error.message);
      if (!image) throw new ImageNotFoundError(`Image not found for project: ${projectId}`);

      return {
        id: image.id,
        project_id: image.id,
        user_id: image.user_id,
        image_url: image.image_url,
        title: image.title,
        created_at: image.created_at,
        updated_at: image.updated_at
      };
    });
  }

  /**
   * Delete an image record
   */
  async deleteImage(projectId: string, userId: string): Promise<DbResult<void>> {
    return this.executeQuery<void>('deleteImage', async () => {
      const supabase = createServerSupabase();
      const { error } = await supabase
        .from('projects')
        .update({
          image_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)
        .eq('user_id', userId);

      if (error) throw new ImageError(ImageErrorCode.STORAGE_ERROR, error.message);
    });
  }

  /**
   * Check database connection
   */
  async checkConnection(): Promise<DbResult<void>> {
    return this.executeQuery('checkConnection', async () => {
      const supabase = createServerSupabase();
      const { error } = await supabase
        .from('projects')
        .select('id')
        .limit(1);

      if (error) throw new ImageError(ImageErrorCode.STORAGE_ERROR, 'Database connection failed');
    });
  }

  /**
   * Get stale uploads older than specified age
   */
  async getStaleUploads(maxAge: number): Promise<DbResult<DbImage[]>> {
    return this.executeQuery<DbImage[]>('getStaleUploads', async () => {
      const supabase = createServerSupabase();
      const cutoffDate = new Date(Date.now() - maxAge).toISOString();
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .lt('updated_at', cutoffDate)
        .not('image_url', 'is', null);

      if (error) throw new ImageError(ImageErrorCode.STORAGE_ERROR, error.message);
      
      return data.map((item: any) => ({
        id: item.id,
        project_id: item.id,
        user_id: item.user_id,
        image_url: item.image_url,
        title: item.title,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
    });
  }

  /**
   * Get failed uploads older than specified age
   */
  async getFailedUploads(maxAge: number): Promise<DbResult<DbImage[]>> {
    return this.executeQuery<DbImage[]>('getFailedUploads', async () => {
      const supabase = createServerSupabase();
      const cutoffDate = new Date(Date.now() - maxAge).toISOString();
      
      // Since there's no status column, we'll consider uploads with no image_url as failed
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .lt('updated_at', cutoffDate)
        .is('image_url', null);

      if (error) throw new ImageError(ImageErrorCode.STORAGE_ERROR, error.message);
      
      return data.map((item: any) => ({
        id: item.id,
        project_id: item.id,
        user_id: item.user_id,
        image_url: item.image_url,
        title: item.title,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
    });
  }
} 