import { injectable, inject } from 'tsyringe';
import { Logger } from 'winston';
import { TYPES } from '../../lib/types';
import { BaseService } from '../../lib/services/base.service';
import { ServiceResult } from '../../types';
import { 
  IDiscoveryRepository, 
  IDiscoveryService,
  DiscoveryResponse
} from './types';

/**
 * Service for discovery operations
 * Simplified to only include methods needed for the Discovery page
 */
@injectable()
export class DiscoveryService extends BaseService implements IDiscoveryService {
  constructor(
    @inject(TYPES.Logger) protected readonly logger: Logger,
    @inject('DiscoveryRepository') private readonly repository: IDiscoveryRepository
  ) {
    super(logger, 'DiscoveryService');
  }

  /**
   * Get all discovery items
   */
  async getDiscoveries(): Promise<ServiceResult<DiscoveryResponse[]>> {
    try {
      this.logger.info('Fetching discovery items');
      const result = await this.repository.getDiscoveries();
      if (result.error) {
        this.logger.error('Error fetching discovery items from repository', { error: result.error });
        throw result.error;
      }

      // Log the data received from the repository
      this.logger.info('Data received from repository in getDiscoveries', {
        count: result.data?.length || 0,
        hasData: !!result.data && result.data.length > 0,
        firstItemHasVideoUrl: result.data && result.data.length > 0 ? !!result.data[0].video_url : false,
        firstItemHasThumbnailUrl: result.data && result.data.length > 0 ? !!result.data[0].thumbnail_url : false
      });

      // Transform the data
      const transformedData = result.data?.map(discovery => ({
        id: discovery.id,
        generationId: discovery.generation_id,
        videoUrl: discovery.video_url,
        thumbnailUrl: discovery.thumbnail_url,
        status: discovery.status,
        duration: discovery.duration,
        displayOrder: discovery.display_order,
        createdAt: discovery.created_at
      })) || [];

      // Log the transformed data
      this.logger.info('Transformed data in getDiscoveries service', {
        count: transformedData.length,
        hasData: transformedData.length > 0,
        firstItem: transformedData.length > 0 ? JSON.stringify(transformedData[0]) : 'No data',
        hasVideoUrls: transformedData.filter(d => !!d.videoUrl).length,
        hasThumbnailUrls: transformedData.filter(d => !!d.thumbnailUrl).length
      });

      return {
        success: true,
        data: transformedData
      };
    } catch (error) {
      return this.handleError(error);
    }
  }
} 