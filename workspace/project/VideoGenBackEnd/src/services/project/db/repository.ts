import { injectable, inject } from 'tsyringe';
import { Logger } from 'winston';
import { TYPES } from '../../../lib/types';
import { BaseRepository } from '../../../lib/services/repository.base';
import { createServerSupabase } from '../../../lib/supabase';
import { DbResult } from '../../../lib/db/types';
import { DbProject, DbProjectGeneration, IProjectRepository } from './types';
import { GenerationStatus } from '../../video/types';

interface RawGeneration {
  id: string;
  project_id: string;
  user_id: string;
  status: string;
  video_url: string | null;
  prompt: string;
  error_message: string | null;
  model_id: string;
  duration: number | null;
  thumbnail_url: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  metadata: Record<string, unknown> | null;
}

@injectable()
export class ProjectRepository extends BaseRepository implements IProjectRepository {
  constructor(
    @inject(TYPES.Logger) protected readonly logger: Logger
  ) {
    super(logger, 'ProjectRepository');
  }

  async getProject(projectId: string): Promise<DbResult<DbProject>> {
    return this.executeQuery('getProject', async () => {
      const supabase = await createServerSupabase();
      const { data, error } = await supabase
        .from('projects')
        .select('*, generations(*)')
        .eq('id', projectId)
        .single();

      if (error) throw error;
      if (!data) throw new Error(`Project not found: ${projectId}`);

      // Transform the data to match DbProject type
      const project: DbProject = {
        id: data.id,
        user_id: data.user_id,
        image_url: data.image_url,
        title: data.title,
        created_at: data.created_at,
        updated_at: data.updated_at,
        generations: data.generations?.map((gen: RawGeneration) => ({
          id: gen.id,
          project_id: gen.project_id,
          user_id: gen.user_id,
          status: gen.status as GenerationStatus,
          video_url: gen.video_url,
          prompt: gen.prompt,
          error_message: gen.error_message,
          model_id: gen.model_id,
          duration: gen.duration || 0,
          thumbnail_url: gen.thumbnail_url,
          started_at: gen.started_at,
          completed_at: gen.completed_at,
          created_at: gen.created_at,
          updated_at: gen.updated_at,
          metadata: gen.metadata || {}
        })) || null
      };

      return project;
    });
  }

  async getProjectsForUser(userId: string): Promise<DbResult<DbProject[]>> {
    return this.executeQuery('getProjectsForUser', async () => {
      const supabase = await createServerSupabase();
      const { data, error } = await supabase
        .from('projects')
        .select('*, generations(*)')
        .eq('user_id', userId);

      if (error) throw error;

      // Transform the data to match DbProject[] type
      const projects: DbProject[] = data.map(item => ({
        id: item.id,
        user_id: item.user_id,
        image_url: item.image_url,
        title: item.title,
        created_at: item.created_at,
        updated_at: item.updated_at,
        generations: item.generations?.map((gen: RawGeneration) => ({
          id: gen.id,
          project_id: gen.project_id,
          user_id: gen.user_id,
          status: gen.status as GenerationStatus,
          video_url: gen.video_url,
          prompt: gen.prompt,
          error_message: gen.error_message,
          model_id: gen.model_id,
          duration: gen.duration || 0,
          thumbnail_url: gen.thumbnail_url,
          started_at: gen.started_at,
          completed_at: gen.completed_at,
          created_at: gen.created_at,
          updated_at: gen.updated_at,
          metadata: gen.metadata || {}
        })) || null
      }));

      return projects;
    });
  }

  async getProjectVideos(projectId: string): Promise<DbResult<DbProjectGeneration[]>> {
    return this.executeQuery('getProjectVideos', async () => {
      const supabase = await createServerSupabase();
      const { data, error } = await supabase
        .from('generations')
        .select('*')
        .eq('project_id', projectId);

      if (error) throw error;

      // Transform the data to match DbProjectGeneration[] type
      const generations: DbProjectGeneration[] = data.map((gen: RawGeneration) => ({
        id: gen.id,
        project_id: gen.project_id,
        user_id: gen.user_id,
        status: gen.status as GenerationStatus,
        video_url: gen.video_url,
        prompt: gen.prompt,
        error_message: gen.error_message,
        model_id: gen.model_id,
        duration: gen.duration || 0,
        thumbnail_url: gen.thumbnail_url,
        started_at: gen.started_at,
        completed_at: gen.completed_at,
        created_at: gen.created_at,
        updated_at: gen.updated_at,
        metadata: gen.metadata || {}
      }));

      return generations;
    });
  }

  async updateGeneration(
    generationId: string,
    updates: Partial<DbProjectGeneration>
  ): Promise<DbResult<void>> {
    return this.executeQuery('updateGeneration', async () => {
      const supabase = await createServerSupabase();
      const { error } = await supabase
        .from('generations')
        .update(updates)
        .eq('id', generationId);

      if (error) throw error;
    });
  }

  async checkConnection(): Promise<DbResult<void>> {
    return this.executeQuery('checkConnection', async () => {
      const supabase = await createServerSupabase();
      const { error } = await supabase.from('projects').select('id').limit(1);
      if (error) throw error;
    });
  }

  async getProjectDetails(projectId: string): Promise<DbResult<DbProject>> {
    return this.executeQuery('getProjectDetails', async () => {
      const supabase = await createServerSupabase();
      const { data, error } = await supabase
        .from('projects')
        .select(`
          id,
          user_id,
          image_url,
          title,
          created_at,
          updated_at,
          generations (
            id,
            project_id,
            user_id,
            video_url,
            status,
            prompt,
            error_message,
            model_id,
            duration,
            thumbnail_url,
            started_at,
            completed_at,
            created_at,
            updated_at,
            metadata
          )
        `)
        .eq('id', projectId)
        .single();

      if (error) throw error;
      if (!data) throw new Error(`Project not found: ${projectId}`);

      // Transform the data to match DbProject type
      const project: DbProject = {
        id: data.id,
        user_id: data.user_id,
        image_url: data.image_url,
        title: data.title,
        created_at: data.created_at,
        updated_at: data.updated_at,
        generations: data.generations?.map((gen: RawGeneration) => ({
          id: gen.id,
          project_id: projectId,
          user_id: data.user_id,
          status: gen.status as GenerationStatus,
          video_url: gen.video_url,
          prompt: gen.prompt,
          error_message: gen.error_message,
          model_id: gen.model_id,
          duration: gen.duration || 0,
          thumbnail_url: gen.thumbnail_url,
          started_at: gen.started_at,
          completed_at: gen.completed_at,
          created_at: gen.created_at,
          updated_at: gen.updated_at,
          metadata: gen.metadata || {}
        })) || null
      };

      return project;
    });
  }
} 