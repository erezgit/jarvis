import { BaseService } from '@/core/services/base/BaseService';
import type { ServiceResult } from '@/core/types/service';
import { DiscoveryServiceTypes } from './types';
import { mapDiscoveryResponseToVideo, mapAvailableVideoResponseToVideo } from './mappers';
import { tokenService } from '@/core/services/token/TokenService';
import { supabase } from '@/lib/supabase/client';

/**
 * Discovery Service
 * 
 * This service handles all interactions with the Discovery API endpoints.
 * It follows the singleton pattern and extends the BaseService.
 */
export class DiscoveryService extends BaseService {
  private static instance: DiscoveryService;
  private maxRetries = 2; // Maximum number of retries for token-related issues

  private constructor() {
    super();
    this.log('constructor', 'DiscoveryService initialized');
  }

  /**
   * Get the singleton instance of the DiscoveryService
   */
  public static getInstance(): DiscoveryService {
    if (!DiscoveryService.instance) {
      DiscoveryService.instance = new DiscoveryService();
    }
    return DiscoveryService.instance;
  }

  /**
   * Attempt to refresh the authentication token
   * @returns Promise<boolean> True if token was refreshed successfully
   */
  private async refreshToken(): Promise<boolean> {
    this.log('refreshToken', 'Attempting to refresh authentication token');
    
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        this.log('refreshToken', { error }, 'error');
        return false;
      }
      
      if (data?.session) {
        // Store the refreshed tokens
        if (data.session.access_token && data.session.refresh_token) {
          tokenService.storeTokens(
            data.session.access_token,
            data.session.refresh_token,
            data.session.expires_in || 3600
          );
          this.log('refreshToken', 'Token refreshed successfully', 'debug');
          return true;
        }
      }
      
      return false;
    } catch (error) {
      this.log('refreshToken', { error }, 'error');
      return false;
    }
  }

  /**
   * Get all discovery videos with retry logic for token issues
   * 
   * Fetches all videos that are currently in the discovery section.
   * 
   * Endpoint: GET /api/discoveries
   */
  async getDiscoveries(retryCount = 0): Promise<ServiceResult<DiscoveryServiceTypes['DiscoveryItemResponse'][]>> {
    const timestamp = new Date().toISOString();
    this.log('getDiscoveries', { retryCount, timestamp }, 'debug');
    
    // Check authentication first
    console.log(`[DiscoveryService][${timestamp}] Checking authentication for getDiscoveries call`);
    const accessToken = tokenService.getAccessToken();
    console.log(`[DiscoveryService][${timestamp}] TokenService.getAccessToken() returned: ${accessToken ? 'token present' : 'null or undefined'}`);
    
    if (!accessToken) {
      // Try to refresh the token if we haven't exceeded max retries
      if (retryCount < this.maxRetries) {
        console.log(`[DiscoveryService][${timestamp}] No token available, retry attempt ${retryCount + 1}/${this.maxRetries}`);
        this.log('getDiscoveries', `Retry attempt ${retryCount + 1}/${this.maxRetries}`, 'debug');
        const refreshed = await this.refreshToken();
        
        if (refreshed) {
          console.log(`[DiscoveryService][${timestamp}] Token refreshed successfully, retrying request`);
          this.log('getDiscoveries', 'Token refreshed, retrying request', 'debug');
          return this.getDiscoveries(retryCount + 1);
        }
      }
      
      console.error(`[DiscoveryService][${timestamp}] Authentication required but no token available after ${retryCount} retries`);
      return {
        data: null,
        error: new Error('Authentication required to fetch discovery videos')
      };
    }
    
    // Enhanced debug logging for API client configuration
    console.log(`[DiscoveryService][${timestamp}] Preparing to make API call to /api/discoveries`);
    this.log('getDiscoveries', {
      apiClientType: 'unified',
      endpoint: '/api/discoveries',
      apiInstance: this.api ? 'initialized' : 'null',
      hasToken: !!tokenService.getAccessToken(),
      tokenLength: tokenService.getAccessToken()?.length || 0,
      timestamp
    }, 'debug');
    
    try {
      // Enhanced debug logging before making the API call
      console.log(`[DiscoveryService][${timestamp}] Making API call to /api/discoveries endpoint`);
      this.log('getDiscoveries', {
        message: 'Making API call to discoveries endpoint',
        endpoint: '/api/discoveries',
        timestamp: new Date().toISOString()
      }, 'debug');
      
      const response = await this.api.get<DiscoveryServiceTypes['DiscoveryItemResponse'][]>('/api/discoveries');
      console.log(`[DiscoveryService][${timestamp}] API call to /api/discoveries completed`, {
        success: !this.isApiError(response),
        status: 'status' in response ? response.status : 'unknown',
        hasData: 'data' in response && !!response.data,
        dataCount: 'data' in response ? (response.data ? response.data.length : 0) : 'N/A'
      });
      
      // Log the actual response data for debugging
      if ('data' in response && response.data) {
        console.log(`[DiscoveryService][${timestamp}] RESPONSE DATA from /api/discoveries:`, {
          count: response.data.length,
          isEmpty: response.data.length === 0,
          data: response.data.map(item => ({
            id: item.id,
            displayOrder: item.displayOrder,
            generationId: item.generationId,
            hasUrl: !!item.videoUrl,
            hasThumbnail: !!item.thumbnailUrl
          }))
        });
      } else if (this.isApiError(response)) {
        console.error(`[DiscoveryService][${timestamp}] API ERROR from /api/discoveries:`, {
          message: response.message,
          status: response.status,
          details: response.details || 'No additional details'
        });
      }
      
      // Check if we got an authentication error (401)
      if ('status' in response && response.status === 401 && retryCount < this.maxRetries) {
        console.log(`[DiscoveryService][${timestamp}] Received 401 unauthorized, attempting to refresh token`);
        this.log('getDiscoveries', 'Received 401 unauthorized, attempting to refresh token', 'debug');
        const refreshed = await this.refreshToken();
        
        if (refreshed) {
          console.log(`[DiscoveryService][${timestamp}] Token refreshed successfully after 401, retrying request`);
          this.log('getDiscoveries', 'Token refreshed, retrying request', 'debug');
          return this.getDiscoveries(retryCount + 1);
        }
      }
      
      // Handle the response
      if (this.isApiError(response)) {
        console.error(`[DiscoveryService][${timestamp}] API error in getDiscoveries:`, response.message);
        return {
          data: null,
          error: new Error(response.message)
        };
      }
      
      console.log(`[DiscoveryService][${timestamp}] getDiscoveries successful, returned ${response.data?.length || 0} items`);
      return {
        data: response.data,
        error: null
      };
    } catch (error) {
      console.error(`[DiscoveryService][${timestamp}] Exception in getDiscoveries:`, error);
      this.log('getDiscoveries', { error }, 'error');
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error occurred')
      };
    }
  }

  /**
   * Get all available videos for discovery with retry logic
   * 
   * Fetches all videos that can be added to the discovery section.
   * This is an admin-only endpoint.
   * 
   * Endpoint: GET /api/discoveries/availableVideos
   */
  async getAvailableVideos(retryCount = 0): Promise<ServiceResult<DiscoveryServiceTypes['AvailableVideoResponse'][]>> {
    const timestamp = new Date().toISOString();
    this.log('getAvailableVideos', { retryCount, timestamp }, 'debug');
    
    // Check authentication first
    console.log(`[DiscoveryService][${timestamp}] Checking authentication for getAvailableVideos call`);
    const accessToken = tokenService.getAccessToken();
    console.log(`[DiscoveryService][${timestamp}] TokenService.getAccessToken() returned: ${accessToken ? 'token present' : 'null or undefined'}`);
    
    if (!accessToken) {
      // Try to refresh the token if we haven't exceeded max retries
      if (retryCount < this.maxRetries) {
        console.log(`[DiscoveryService][${timestamp}] No token available, retry attempt ${retryCount + 1}/${this.maxRetries}`);
        this.log('getAvailableVideos', `Retry attempt ${retryCount + 1}/${this.maxRetries}`, 'debug');
        const refreshed = await this.refreshToken();
        
        if (refreshed) {
          console.log(`[DiscoveryService][${timestamp}] Token refreshed successfully, retrying request`);
          this.log('getAvailableVideos', 'Token refreshed, retrying request', 'debug');
          return this.getAvailableVideos(retryCount + 1);
        }
      }
      
      console.error(`[DiscoveryService][${timestamp}] Authentication required but no token available after ${retryCount} retries`);
      return {
        data: null,
        error: new Error('Authentication required to fetch available videos')
      };
    }
    
    // Enhanced debug logging for API client configuration
    console.log(`[DiscoveryService][${timestamp}] Preparing to make API call to /api/discoveries/availableVideos`);
    this.log('getAvailableVideos', {
      apiClientType: 'unified',
      endpoint: '/api/discoveries/availableVideos',
      apiInstance: this.api ? 'initialized' : 'null',
      hasToken: !!tokenService.getAccessToken(),
      tokenLength: tokenService.getAccessToken()?.length || 0,
      timestamp
    }, 'debug');
    
    try {
      // Enhanced debug logging before making the API call
      console.log(`[DiscoveryService][${timestamp}] Making API call to /api/discoveries/availableVideos endpoint`);
      this.log('getAvailableVideos', {
        message: 'Making API call to availableVideos endpoint',
        endpoint: '/api/discoveries/availableVideos',
        timestamp: new Date().toISOString()
      }, 'debug');
      
      const response = await this.api.get<DiscoveryServiceTypes['AvailableVideoResponse'][]>('/api/discoveries/availableVideos');
      console.log(`[DiscoveryService][${timestamp}] API call to /api/discoveries/availableVideos completed`, {
        success: !this.isApiError(response),
        status: 'status' in response ? response.status : 'unknown',
        hasData: 'data' in response && !!response.data,
        dataCount: 'data' in response ? (response.data ? response.data.length : 0) : 'N/A'
      });
      
      // Log the actual response data for debugging
      if ('data' in response && response.data) {
        console.log(`[DiscoveryService][${timestamp}] RESPONSE DATA from /api/discoveries/availableVideos:`, {
          count: response.data.length,
          isEmpty: response.data.length === 0,
          data: response.data.slice(0, 3).map(item => ({
            id: item.id,
            hasUrl: !!item.videoUrl,
            hasThumbnail: !!item.thumbnailUrl,
            projectTitle: item.projects?.title || 'No title'
          }))
        });
      } else if (this.isApiError(response)) {
        console.error(`[DiscoveryService][${timestamp}] API ERROR from /api/discoveries/availableVideos:`, {
          message: response.message,
          status: response.status,
          details: response.details || 'No additional details'
        });
      }
      
      // Check if we got an authentication error (401)
      if ('status' in response && response.status === 401 && retryCount < this.maxRetries) {
        console.log(`[DiscoveryService][${timestamp}] Received 401 unauthorized, attempting to refresh token`);
        this.log('getAvailableVideos', 'Received 401 unauthorized, attempting to refresh token', 'debug');
        const refreshed = await this.refreshToken();
        
        if (refreshed) {
          console.log(`[DiscoveryService][${timestamp}] Token refreshed successfully after 401, retrying request`);
          this.log('getAvailableVideos', 'Token refreshed, retrying request', 'debug');
          return this.getAvailableVideos(retryCount + 1);
        }
      }
      
      // Handle the response
      if (this.isApiError(response)) {
        console.error(`[DiscoveryService][${timestamp}] API error in getAvailableVideos:`, response.message);
        return {
          data: null,
          error: new Error(response.message)
        };
      }
      
      console.log(`[DiscoveryService][${timestamp}] getAvailableVideos successful, returned ${response.data?.length || 0} items`);
      return {
        data: response.data,
        error: null
      };
    } catch (error) {
      console.error(`[DiscoveryService][${timestamp}] Exception in getAvailableVideos:`, error);
      this.log('getAvailableVideos', { error }, 'error');
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error occurred')
      };
    }
  }

  /**
   * Add a video to the discovery section
   * 
   * @param request - The request containing the generation ID and optional display order
   * 
   * Endpoint: POST /api/discoveries
   */
  async addToDiscovery(
    request: DiscoveryServiceTypes['AddToDiscoveryRequest']
  ): Promise<ServiceResult<DiscoveryServiceTypes['DiscoveryItemResponse']>> {
    this.log('addToDiscovery', { request });
    
    // Check authentication first
    const accessToken = tokenService.getAccessToken();
    if (!accessToken) {
      this.log('addToDiscovery', 'No access token available', 'error');
      return {
        data: null,
        error: new Error('Authentication required to add video to discovery')
      };
    }
    
    return this.handleRequest<DiscoveryServiceTypes['DiscoveryItemResponse']>(() => {
      this.log('addToDiscovery', {
        message: 'Making API call to add video to discovery',
        endpoint: '/api/discoveries',
        requestData: request,
        timestamp: new Date().toISOString()
      }, 'debug');
      
      return this.api.post<DiscoveryServiceTypes['DiscoveryItemResponse']>('/api/discoveries', request);
    });
  }

  /**
   * Remove a video from the discovery section
   * 
   * @param id - The ID of the discovery item to remove
   * 
   * Endpoint: DELETE /api/discoveries/:id
   */
  async removeFromDiscovery(id: string): Promise<ServiceResult<boolean>> {
    this.log('removeFromDiscovery', { id });
    
    // Check authentication first
    const accessToken = tokenService.getAccessToken();
    if (!accessToken) {
      this.log('removeFromDiscovery', 'No access token available', 'error');
      return {
        data: null,
        error: new Error('Authentication required to remove video from discovery')
      };
    }
    
    return this.handleRequest<boolean>(() => {
      this.log('removeFromDiscovery', {
        message: 'Making API call to remove video from discovery',
        endpoint: `/api/discoveries/${id}`,
        timestamp: new Date().toISOString()
      }, 'debug');
      
      return this.api.delete<boolean>(`/api/discoveries/${id}`);
    });
  }

  /**
   * Update the display order of a video in the discovery section
   * 
   * @param id - The ID of the discovery item to update
   * @param request - The request containing the new display order
   * 
   * Endpoint: PUT /api/discoveries/:id/order
   */
  async updateVideoOrder(
    id: string, 
    request: DiscoveryServiceTypes['UpdateOrderRequest']
  ): Promise<ServiceResult<DiscoveryServiceTypes['DiscoveryItemResponse']>> {
    this.log('updateVideoOrder', { id, request });
    
    // Check authentication first
    const accessToken = tokenService.getAccessToken();
    if (!accessToken) {
      this.log('updateVideoOrder', 'No access token available', 'error');
      return {
        data: null,
        error: new Error('Authentication required to update video order')
      };
    }
    
    return this.handleRequest<DiscoveryServiceTypes['DiscoveryItemResponse']>(() => {
      this.log('updateVideoOrder', {
        message: 'Making API call to update video order',
        endpoint: `/api/discoveries/${id}/order`,
        requestData: request,
        timestamp: new Date().toISOString()
      }, 'debug');
      
      return this.api.put<DiscoveryServiceTypes['DiscoveryItemResponse']>(`/api/discoveries/${id}/order`, request);
    });
  }
}

// Export the singleton instance
export const discoveryService = DiscoveryService.getInstance();
