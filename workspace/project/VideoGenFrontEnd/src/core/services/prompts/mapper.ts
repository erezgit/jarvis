import type { ApiError } from '@/core/types/api';
import type { 
  Category, 
  PromptOption, 
  PromptCategoryResponse, 
  PromptOptionResponse,
  ApiPromptComponent,
  ApiPromptComponentResponse
} from './types';
import { PromptError, type PromptErrorCode } from './types';

// Define interfaces for raw API response data
interface RawCategoryData {
  id: string;
  name: string;
  options?: RawOptionData[];
}

interface RawOptionData {
  id: string;
  text: string;
  category: string;
  imageUrl?: string;
  image_url?: string;
  description?: string;
  display_order?: number;
}

interface RawCategoriesResponse {
  categories?: RawCategoryData[];
  total?: number;
}

interface RawOptionsResponse {
  options?: RawOptionData[];
  total?: number;
}

/**
 * Mapper class for prompt selection responses
 * Handles transformation of API responses to domain types
 */
export class PromptMapper {
  /**
   * Maps raw API response to Category array
   */
  static toCategories(data: unknown): Category[] {
    if (!data || typeof data !== 'object') {
      throw new PromptError('Invalid categories data', 'SERVICE_ERROR');
    }

    // Handle the new API response structure where categories are object keys
    if (this.isApiPromptComponentResponse(data)) {
      const response = data as ApiPromptComponentResponse;
      const categories: Category[] = [];

      // Convert object keys to category objects
      for (const [categoryId, options] of Object.entries(response)) {
        categories.push({
          id: categoryId,
          name: this.getCategoryDisplayName(categoryId),
          options: Array.isArray(options) ? options.map(option => this.toOption(option)) : [],
        });
      }

      return categories;
    }

    // Handle the old response format for backward compatibility
    const response = data as RawCategoriesResponse;
    const categories = Array.isArray(response.categories) ? response.categories : [];

    return categories.map((category: RawCategoryData) => ({
      id: category.id,
      name: category.name,
      options: Array.isArray(category.options) ? category.options.map(PromptMapper.toOption) : [],
    }));
  }

  /**
   * Maps raw API response to PromptOption
   */
  static toOption(data: unknown): PromptOption {
    if (!data || typeof data !== 'object') {
      throw new PromptError('Invalid option data', 'SERVICE_ERROR');
    }

    // Handle the new API response structure
    if (this.isApiPromptComponent(data)) {
      const component = data as ApiPromptComponent;
      return {
        id: component.id,
        text: component.name,
        category: component.category,
        imageUrl: component.image_url || '',
        description: component.description,
        displayOrder: component.display_order,
      };
    }

    // Handle the old response format for backward compatibility
    const option = data as RawOptionData;
    return {
      id: option.id,
      text: option.text,
      category: option.category,
      imageUrl: option.imageUrl || option.image_url || '',
      description: option.description,
      displayOrder: option.display_order,
    };
  }

  /**
   * Maps raw API response to PromptCategoryResponse
   */
  static toCategoryResponse(data: unknown): PromptCategoryResponse {
    if (!data || typeof data !== 'object') {
      throw new PromptError('Invalid category response data', 'SERVICE_ERROR');
    }

    const response = data as RawCategoriesResponse;
    return {
      categories: PromptMapper.toCategories(response),
      total: response.total || 0,
    };
  }

  /**
   * Maps raw API response to PromptOptionResponse
   */
  static toOptionResponse(data: unknown): PromptOptionResponse {
    if (!data || typeof data !== 'object') {
      throw new PromptError('Invalid option response data', 'SERVICE_ERROR');
    }

    const response = data as RawOptionsResponse;
    const options = Array.isArray(response.options) ? response.options : [];

    return {
      options: options.map(PromptMapper.toOption),
      total: response.total || 0,
    };
  }

  /**
   * Maps API error to PromptError
   */
  static toError(error: unknown): PromptError {
    if (error instanceof PromptError) {
      return error;
    }

    if (error instanceof Error) {
      return new PromptError(error.message, 'SERVICE_ERROR');
    }

    if (typeof error === 'string') {
      return new PromptError(error, 'SERVICE_ERROR');
    }

    // Handle API error response
    if (PromptMapper.isApiError(error)) {
      return new PromptError(error.message, PromptMapper.mapErrorCode(error.code), {
        status: error.status,
        code: error.code,
      });
    }

    return new PromptError('Unknown error occurred', 'SERVICE_ERROR');
  }

  /**
   * Maps API error code to PromptErrorCode
   */
  private static mapErrorCode(code?: string): PromptErrorCode {
    switch (code?.toUpperCase()) {
      case 'CATEGORY_NOT_FOUND':
        return 'CATEGORY_NOT_FOUND';
      case 'INVALID_CATEGORY':
        return 'INVALID_CATEGORY';
      case 'INVALID_OPTION':
        return 'INVALID_OPTION';
      case 'NETWORK_ERROR':
        return 'NETWORK_ERROR';
      case 'AUTHENTICATION_ERROR':
        return 'AUTHENTICATION_ERROR';
      default:
        return 'SERVICE_ERROR';
    }
  }

  /**
   * Type guard for API error
   */
  private static isApiError(error: unknown): error is ApiError {
    return typeof error === 'object' && error !== null && 'message' in error && 'status' in error;
  }

  /**
   * Type guard for API prompt component response
   */
  private static isApiPromptComponentResponse(data: unknown): data is ApiPromptComponentResponse {
    return (
      typeof data === 'object' && 
      data !== null && 
      Object.values(data).every(value => Array.isArray(value))
    );
  }

  /**
   * Type guard for API prompt component
   */
  private static isApiPromptComponent(data: unknown): data is ApiPromptComponent {
    return (
      typeof data === 'object' && 
      data !== null && 
      'id' in data && 
      'name' in data && 
      'category' in data
    );
  }

  /**
   * Gets display name for a category
   */
  private static getCategoryDisplayName(categoryId: string): string {
    const displayNames: Record<string, string> = {
      'environment': 'Environment',
      'treatment': 'Treatment',
      'object': 'Object',
    };

    return displayNames[categoryId] || categoryId.charAt(0).toUpperCase() + categoryId.slice(1);
  }
}
