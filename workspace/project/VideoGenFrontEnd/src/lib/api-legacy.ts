import { config } from '@/config/env';
import { tokenService } from '@/core/services/token';
import { apiAdapter, isApiError as adapterIsApiError } from './api/adapter';

interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  message?: string;
}

interface ApiError {
  message: string;
  status: number;
}

type HeadersInit = Headers | Record<string, string> | [string, string][];

export const isApiError = (response: unknown): response is ApiError => {
  return (
    Boolean(response) &&
    typeof (response as ApiError).message === 'string' &&
    typeof (response as ApiError).status === 'number'
  );
};

/**
 * @deprecated Use the unified API client from @/core/services/api/unified-client instead
 */
class ApiService {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = config.apiUrl) {
    if (!baseUrl) {
      throw new Error('API base URL is required');
    }
    this.baseUrl = baseUrl;
    console.log('=== API SERVICE INITIALIZED (LEGACY) ===', { baseUrl });
    console.warn('This API client is deprecated. Please use the unified API client instead.');
  }

  setToken(token: string | null) {
    console.warn('setToken is deprecated. Token management is handled by Supabase.');
    this.token = token;
    // Forward to adapter for compatibility
    apiAdapter.setToken(token);
  }

  private getHeaders(body?: unknown): HeadersInit {
    const headers: HeadersInit = {};

    // Only set Content-Type if not FormData
    if (!(body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    // Get token from tokenService or instance
    const token = this.token || tokenService.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T> | ApiError> {
    console.log('=== API RESPONSE RECEIVED ===', {
      url: response.url,
      status: response.status,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries()),
    });

    let responseData;
    try {
      responseData = await response.json();
      console.log('=== Raw Response Data ===', responseData);
    } catch (e) {
      console.error('=== Response Parse Error ===', e);
      return {
        message: 'Failed to parse server response',
        status: response.status,
      };
    }

    if (!response.ok) {
      console.error('=== API ERROR ===', {
        status: response.status,
        responseData,
        url: response.url,
      });

      // Handle 401 errors
      if (response.status === 401) {
        tokenService.clearTokens();
        window.location.href = '/login';
      }

      return {
        message: responseData.error || responseData.message || 'An unexpected error occurred',
        status: response.status,
      };
    }

    // Handle different response formats
    const data = responseData.data || responseData;

    console.log('=== API SUCCESS ===', {
      url: response.url,
      originalData: responseData,
      processedData: data,
    });

    return {
      data: data as T,
      status: response.status,
    };
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T> | ApiError> {
    console.log('=== API GET REQUEST ===', {
      url: `${this.baseUrl}${endpoint}`,
      headers: this.getHeaders(),
    });

    // Use the adapter to make the actual request
    return apiAdapter.get<T>(endpoint);
  }

  async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T> | ApiError> {
    const headers = this.getHeaders(body);
    const url = `${this.baseUrl}${endpoint}`;

    console.log('=== API POST REQUEST ===', {
      url,
      baseUrl: this.baseUrl,
      endpoint,
      headers,
      isFormData: body instanceof FormData,
    });

    // Use the adapter to make the actual request
    return apiAdapter.post<T>(endpoint, body);
  }

  async put<T>(endpoint: string, body: unknown): Promise<ApiResponse<T> | ApiError> {
    const headers = this.getHeaders(body);

    console.log('=== API PUT REQUEST ===', {
      url: `${this.baseUrl}${endpoint}`,
      headers,
      isFormData: body instanceof FormData,
    });

    // Use the adapter to make the actual request
    return apiAdapter.put<T>(endpoint, body);
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T> | ApiError> {
    // Use the adapter to make the actual request
    return apiAdapter.delete<T>(endpoint);
  }
}

// Export the adapter instance as the API client
export const api = apiAdapter;
export type { ApiResponse, ApiError }; 