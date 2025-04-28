import { ServiceError } from './errors';
import type { ServiceErrorCode } from './types';
import type { ServiceResult } from '@/core/types/service';

export abstract class BaseService {
  protected api = {
    get: async <T>(url: string): Promise<T> => {
      const response = await fetch(url);
      if (!response.ok) {
        throw new ServiceError('API request failed', 'REQUEST_FAILED');
      }
      return response.json();
    },
    post: async <T>(url: string, data: unknown): Promise<T> => {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new ServiceError('API request failed', 'REQUEST_FAILED');
      }
      return response.json();
    },
    patch: async <T>(url: string, data: unknown): Promise<T> => {
      const response = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new ServiceError('API request failed', 'REQUEST_FAILED');
      }
      return response.json();
    },
    delete: async (url: string): Promise<void> => {
      const response = await fetch(url, { method: 'DELETE' });
      if (!response.ok) {
        throw new ServiceError('API request failed', 'REQUEST_FAILED');
      }
    },
  };

  protected async handleRequest<T>(request: () => Promise<T>): Promise<ServiceResult<T>> {
    try {
      const data = await request();
      return { data, error: null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }
}
