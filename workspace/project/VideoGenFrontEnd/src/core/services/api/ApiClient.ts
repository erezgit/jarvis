import type { ApiResponse } from '@/types/api';
import { TokenManager } from './TokenManager';
import { getSecurityHeaders, generateCsrfToken } from '@/utils/security';
import { ApiError, mapHttpError } from './errors';
import { ApiCache } from './cache';

interface RequestConfig extends RequestInit {
  retries?: number;
  retryDelay?: number;
  useCache?: boolean;
  cacheTime?: number;
}

export class ApiClient {
  private baseUrl: string;
  private tokenManager: TokenManager;
  private cache: ApiCache;

  constructor(baseUrl: string) {
    if (!baseUrl) {
      throw new Error('API base URL is required');
    }
    this.baseUrl = baseUrl;
    this.tokenManager = new TokenManager();
    this.cache = new ApiCache();
    // Generate initial CSRF token
    generateCsrfToken();
  }

  private async getAuthHeader(): Promise<Headers> {
    const headers = getSecurityHeaders();
    const token = this.tokenManager.get();

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  private async handleRateLimit(response: Response): Promise<Response> {
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 60000;

      throw new ApiError('RATE_LIMIT', 'Too many requests', 429, Math.ceil(waitTime / 1000));
    }
    return response;
  }

  private getCacheKey(path: string, options: RequestConfig): string {
    return `${options.method || 'GET'}:${path}`;
  }

  private async executeRequest<T>(
    path: string,
    options: RequestConfig = {},
  ): Promise<ApiResponse<T>> {
    const cacheKey = this.getCacheKey(path, options);

    // Try to get from cache for GET requests
    if (options.useCache !== false && options.method === 'GET') {
      const cachedData = this.cache.get<T>(cacheKey);
      if (cachedData) {
        return {
          status: 'success',
          data: cachedData,
        };
      }
    }

    try {
      const url = `${this.baseUrl}${path}`;
      const headers = await this.getAuthHeader();

      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle rate limiting
      await this.handleRateLimit(response);

      if (!response.ok) {
        // Handle 401 specifically for token issues
        if (response.status === 401) {
          this.tokenManager.clear();
        }
        throw mapHttpError(response.status);
      }

      const responseData = await response.json();

      // Handle nested data structure
      const data = responseData.data || responseData;

      // Cache successful GET requests
      if (options.useCache !== false && options.method === 'GET') {
        this.cache.set(cacheKey, data, options.cacheTime);
      }

      return {
        status: 'success',
        data: data as T,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        return {
          status: 'error',
          code: error.code,
          message: error.message,
          retryAfter: error.retryAfter,
        };
      }

      return {
        status: 'error',
        code: 'REQUEST_FAILED',
        message: error instanceof Error ? error.message : 'Request failed',
      };
    }
  }

  async get<T>(path: string, options: RequestConfig = {}): Promise<ApiResponse<T>> {
    return this.executeRequest<T>(path, { ...options, method: 'GET' });
  }

  async post<T>(path: string, body: unknown, options: RequestConfig = {}): Promise<ApiResponse<T>> {
    // Invalidate GET cache for the same path when doing POST
    this.cache.invalidate(this.getCacheKey(path, { method: 'GET' }));

    return this.executeRequest<T>(path, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(path: string, body: unknown, options: RequestConfig = {}): Promise<ApiResponse<T>> {
    // Invalidate GET cache for the same path when doing PUT
    this.cache.invalidate(this.getCacheKey(path, { method: 'GET' }));

    return this.executeRequest<T>(path, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(path: string, options: RequestConfig = {}): Promise<ApiResponse<T>> {
    // Invalidate GET cache for the same path when doing DELETE
    this.cache.invalidate(this.getCacheKey(path, { method: 'GET' }));

    return this.executeRequest<T>(path, { ...options, method: 'DELETE' });
  }
}
