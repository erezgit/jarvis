import { ServiceResult, DbResult } from '../../types';
import { GenerationStatus } from '../video/types';

/**
 * Database representation of a discovery item
 */
export interface DbDiscovery {
  id: string;
  generation_id: string;
  display_order: number;
  created_at: string;
  updated_at: string;
  created_by: string;
}

/**
 * Extended discovery item with video data
 */
export interface DbDiscoveryWithVideo extends DbDiscovery {
  video_url: string | null;
  thumbnail_url: string | null;
  status: GenerationStatus;
  duration: number | null;
}

/**
 * Response format for discovery items
 */
export interface DiscoveryResponse {
  id: string;
  generationId: string;
  videoUrl: string | null;
  thumbnailUrl: string | null;
  status: GenerationStatus;
  duration: number | null;
  displayOrder: number;
  createdAt: string;
}

/**
 * Request to create a new discovery item
 */
export interface CreateDiscoveryRequest {
  generationId: string;
  displayOrder?: number;
}

/**
 * Request to update discovery order
 */
export interface UpdateDiscoveryOrderRequest {
  displayOrder: number;
}

/**
 * Repository interface for discovery operations
 * Simplified to only include methods needed for the Discovery page
 */
export interface IDiscoveryRepository {
  /**
   * Get all discovery items with video data
   */
  getDiscoveries(): Promise<DbResult<DbDiscoveryWithVideo[]>>;
}

/**
 * Service interface for discovery operations
 * Simplified to only include methods needed for the Discovery page
 */
export interface IDiscoveryService {
  /**
   * Get all discovery items
   */
  getDiscoveries(): Promise<ServiceResult<DiscoveryResponse[]>>;
} 