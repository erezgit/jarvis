import { getApiClient, getUnifiedApiClient } from '../api/factory';
import type { ServiceResult, ServiceOptions } from '@/core/types/service';
import type { ApiResponse, ApiError } from '@/core/types/api';
import { config } from '@/config/env';

export abstract class BaseService {
  // Legacy API client (kept for backward compatibility)
  protected readonly legacyApi = getApiClient();
  
  // New unified API client (preferred)
  protected readonly api = getUnifiedApiClient();

  protected constructor() {
    this.log('constructor', `${this.constructor.name} initialized`);
  }

  protected async handleRequest<T>(
    request: () => Promise<ApiResponse<T> | ApiError>,
    options: ServiceOptions = {},
  ): Promise<ServiceResult<T>> {
    try {
      const response = await request();

      if (this.isApiError(response)) {
        throw new Error(response.message);
      }

      return { data: response.data, error: null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  protected isApiError(response: unknown): response is ApiError {
    return (
      typeof response === 'object' &&
      response !== null &&
      'message' in response &&
      'status' in response &&
      !('data' in response)
    );
  }

  protected log(method: string, data: unknown, level: 'debug' | 'error' | 'info' = 'info'): void {
    // Only log debug messages in development
    if (level === 'debug' && config.environment !== 'development') {
      return;
    }
    
    console[level](`[${this.constructor.name}] ${method}:`, data);
  }
}

// Helper function to check if response is an ApiError
function isApiError(response: ApiResponse<unknown> | ApiError): response is ApiError {
  return 'message' in response && !('data' in response);
}
