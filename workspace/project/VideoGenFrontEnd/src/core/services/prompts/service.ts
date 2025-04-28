import { BaseService } from '@/core/services/base/BaseService';
import type { ServiceResult } from '@/core/types/service';
import type { ApiResponse } from '@/core/types/api';
import { PromptMapper } from './mapper';
import { mockCategories, mockDelay } from './mock/data';
import { PromptError } from './types';
import { supabase } from '@/lib/supabase/client';
import type {
  Category,
  PromptOption,
  PromptCategoryResponse,
  PromptOptionResponse,
  PromptServiceOptions,
  ApiPromptComponentResponse,
} from './types';

/**
 * Service responsible for handling prompt selection operations
 * Follows the singleton pattern and extends BaseService
 */
export class PromptService extends BaseService {
  private static instance: PromptService;
  private useMockData: boolean;

  private constructor(options: PromptServiceOptions = {}) {
    super();
    this.useMockData = options.useMockData ?? false;
    this.log('constructor', 'PromptService initialized');
  }

  /**
   * Gets the singleton instance of PromptService
   */
  public static getInstance(options: PromptServiceOptions = {}): PromptService {
    if (!PromptService.instance) {
      PromptService.instance = new PromptService(options);
    }
    return PromptService.instance;
  }

  /**
   * Verifies authentication before making API calls
   * @private
   */
  private async verifyAuthentication(): Promise<boolean> {
    try {
      const { data } = await supabase.auth.getSession();
      const hasSession = !!data?.session;
      const hasToken = !!data?.session?.access_token;
      const expiresAt = data?.session?.expires_at ? new Date(data.session.expires_at * 1000) : null;
      const now = new Date();
      const isExpired = expiresAt ? expiresAt < now : false;
      const userId = data?.session?.user?.id;
      
      this.log('verifyAuthentication', {
        hasSession,
        hasToken,
        expiresAt: expiresAt?.toISOString(),
        now: now.toISOString(),
        isExpired,
        userId,
      }, 'debug');
      
      return hasToken && !isExpired;
    } catch (error) {
      this.log('verifyAuthentication', { error }, 'error');
      return false;
    }
  }

  /**
   * Gets all available prompt categories
   */
  async getCategories(): Promise<ServiceResult<Category[]>> {
    this.log('getCategories', 'Fetching all prompt categories');

    // Verify authentication
    const isAuthenticated = await this.verifyAuthentication();
    if (!isAuthenticated) {
      this.log('getCategories', 'Not authenticated, using mock data', 'debug');
      return this.getMockCategories();
    }

    // Use mock data if specified
    if (this.useMockData) {
      this.log('getCategories', 'Using mock data', 'debug');
      return this.getMockCategories();
    }

    this.log('getCategories', 'Making API call to /api/prompts/components', 'debug');
    
    return this.handleRequest<Category[]>(async () => {
      try {
        this.log('getCategories', 'Sending request to API', 'debug');
        const response = await this.api.get<ApiPromptComponentResponse>('/api/prompts/components');
        
        this.log('getCategories', { responseStatus: response.status, hasData: 'data' in response }, 'debug');
        
        if (this.isApiError(response)) {
          this.log('getCategories', { error: response }, 'error');
          throw new PromptError('Failed to fetch prompt categories', 'SERVICE_ERROR');
        }
        
        const categories = PromptMapper.toCategories(response.data);
        this.log('getCategories', { categoriesCount: categories.length, categories: categories.map(c => c.id) }, 'debug');
        
        return {
          data: categories,
          status: response.status,
        };
      } catch (error) {
        this.log('getCategories', { error }, 'error');
        throw error;
      }
    });
  }

  /**
   * Gets options for a specific category
   */
  async getCategoryOptions(categoryId: string): Promise<ServiceResult<PromptOption[]>> {
    this.log('getCategoryOptions', { categoryId });

    // Verify authentication
    const isAuthenticated = await this.verifyAuthentication();
    if (!isAuthenticated) {
      this.log('getCategoryOptions', 'Not authenticated, using mock data', 'debug');
      return this.getMockCategoryOptions(categoryId);
    }

    // Use mock data if specified
    if (this.useMockData) {
      return this.getMockCategoryOptions(categoryId);
    }

    return this.handleRequest<PromptOption[]>(async () => {
      // Since the API returns all categories at once, we'll extract the options for the requested category
      const result = await this.getCategories();
      
      if (result.error) {
        throw result.error;
      }
      
      const categories = result.data || [];
      const category = categories.find(c => c.id === categoryId);
      
      if (!category) {
        throw new PromptError(`Category not found: ${categoryId}`, 'CATEGORY_NOT_FOUND');
      }
      
      return {
        data: category.options,
        status: 200,
      };
    });
  }

  /**
   * Gets mock categories for development/testing
   * @private
   */
  private async getMockCategories(): Promise<ServiceResult<Category[]>> {
    try {
      await mockDelay();

      // Return the mock categories directly since they're already in the correct format
      // No need to map through PromptMapper.toCategories
      return {
        data: mockCategories,
        error: null,
      };
    } catch (error) {
      this.log('getCategories', { error }, 'error');
      return {
        data: null,
        error: PromptMapper.toError(error),
      };
    }
  }

  /**
   * Gets mock category options for development/testing
   * @private
   */
  private async getMockCategoryOptions(categoryId: string): Promise<ServiceResult<PromptOption[]>> {
    try {
      await mockDelay();

      const category = mockCategories.find((c) => c.id === categoryId);
      if (!category) {
        throw new PromptError(`Category not found: ${categoryId}`, 'CATEGORY_NOT_FOUND');
      }

      // Return the options directly since they're already in the correct format
      return {
        data: category.options,
        error: null,
      };
    } catch (error) {
      this.log('getCategoryOptions', { error, categoryId }, 'error');
      return {
        data: null,
        error: PromptMapper.toError(error),
      };
    }
  }
}

// Export singleton instance
export const promptService = PromptService.getInstance({ useMockData: false });
