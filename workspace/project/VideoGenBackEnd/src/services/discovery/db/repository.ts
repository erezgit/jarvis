import { injectable, inject } from 'tsyringe';
import { Logger } from 'winston';
import { TYPES } from '../../../lib/types';
import { BaseRepository } from '../../../lib/services/repository.base';
import { createServerSupabase } from '../../../lib/supabase';
import { DbResult } from '../../../types';
import { IDiscoveryRepository, DbDiscoveryWithVideo } from '../types';

/**
 * Repository for discovery operations
 * Simplified to only include methods needed for the Discovery page
 */
@injectable()
export class DiscoveryRepository extends BaseRepository implements IDiscoveryRepository {
  constructor(
    @inject(TYPES.Logger) protected readonly logger: Logger
  ) {
    super(logger, 'DiscoveryRepository');
  }

  /**
   * Get all discovery items with video data
   */
  async getDiscoveries(): Promise<DbResult<DbDiscoveryWithVideo[]>> {
    return this.executeQuery('getDiscoveries', async () => {
      this.logger.info('Executing getDiscoveries query');
      const supabase = await createServerSupabase();
      
      // Join discoveries with generations to get video data
      const { data, error } = await supabase
        .from('discoveries')
        .select(`
          id,
          generation_id,
          display_order,
          created_at,
          updated_at,
          created_by,
          generations:generation_id (
            video_url,
            thumbnail_url,
            status,
            duration
          )
        `)
        .order('display_order', { ascending: true });

      if (error) {
        this.logger.error('Error in getDiscoveries query', { error });
        throw error;
      }

      this.logger.info('getDiscoveries query successful', { count: data.length });

      // Log the raw data from Supabase
      this.logger.info('Raw data from Supabase in getDiscoveries', {
        count: data?.length || 0,
        firstItem: data && data.length > 0 ? JSON.stringify(data[0]) : 'No data',
        hasGenerations: data && data.length > 0 ? !!data[0].generations : false
      });

      // Transform the data to match DbDiscoveryWithVideo[] type
      const discoveries: DbDiscoveryWithVideo[] = data.map((item: any) => {
        // Log each item's generations object to see its structure
        if (item.id) {
          this.logger.info(`Processing discovery item ${item.id}`, {
            hasGenerations: !!item.generations,
            generationsType: item.generations ? typeof item.generations : 'undefined',
            generationsKeys: item.generations ? Object.keys(item.generations) : []
          });
        }

        return {
          id: item.id,
          generation_id: item.generation_id,
          display_order: item.display_order,
          created_at: item.created_at,
          updated_at: item.updated_at,
          created_by: item.created_by,
          video_url: item.generations ? (item.generations as any).video_url || null : null,
          thumbnail_url: item.generations ? (item.generations as any).thumbnail_url || null : null,
          status: item.generations ? (item.generations as any).status : null,
          duration: item.generations ? (item.generations as any).duration || null : null
        };
      });

      // Log the transformed data
      this.logger.info('Transformed discovery data', {
        count: discoveries.length,
        firstItem: discoveries.length > 0 ? JSON.stringify(discoveries[0]) : 'No data',
        hasVideoUrls: discoveries.filter(d => !!d.video_url).length,
        hasThumbnailUrls: discoveries.filter(d => !!d.thumbnail_url).length
      });

      return discoveries;
    });
  }
} 