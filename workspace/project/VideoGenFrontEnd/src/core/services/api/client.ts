/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import { config } from '@/config/env';
import type { ApiResponse, ApiError, ApiConfig } from '@/core/types/api';
import { supabase } from '@/lib/supabase/client';

// Type guard to check if a response is an ApiError with shouldRetry property
function isRetryableError(
  response: ApiResponse<unknown> | ApiError,
): response is ApiError & { shouldRetry: boolean } {
  return 'shouldRetry' in response && (response as ApiError).shouldRetry === true;
}

export class ApiClient {
  private config: ApiConfig;

  constructor(config: ApiConfig) {
    this.config = config;
  }

  private async getHeaders(isFormData: boolean = false): Promise<HeadersInit> {
    const headers: HeadersInit = {};

    // Only set Content-Type for non-FormData requests
    // For FormData, the browser will set the appropriate multipart/form-data content type with boundary
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    // Get token directly from Supabase
    try {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.access_token) {
        console.log('Adding authorization header with Supabase token');
        headers['Authorization'] = `Bearer ${data.session.access_token}`;
      } else {
        console.log('No Supabase token available for request');
      }
    } catch (error) {
      console.error('Error getting Supabase session:', error);
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T> | ApiError> {
    if (!response.ok) {
      if (response.status === 401) {
        // Let Supabase handle the refresh and redirect
        const { data, error } = await supabase.auth.refreshSession();

        if (data?.session) {
          console.log('Token refreshed successfully via Supabase, will retry the request');
          return {
            message: 'Token refreshed, please retry request',
            status: 401,
            shouldRetry: true,
          };
        } else {
          console.log('Token refresh failed, redirecting to login');
          // Let Supabase handle the sign out
          await supabase.auth.signOut();
          window.location.href = '/login';
        }
      }

      // Try to get more detailed error information from the response
      try {
        // Try to parse the response as JSON to get more detailed error information
        const errorData = await response.json();
        console.error('Server error details:', errorData);

        return {
          message: errorData.message || errorData.error || 'Request failed',
          details: errorData,
          status: response.status,
        };
      } catch (parseError) {
        // If we can't parse the response as JSON, try to get the text
        try {
          const errorText = await response.text();
          console.error('Server error text:', errorText);

          return {
            message: errorText || 'Request failed',
            status: response.status,
          };
        } catch (textError) {
          // If we can't get the text either, return a generic error
          return {
            message: 'Request failed',
            status: response.status,
          };
        }
      }
    }

    try {
      const data = await response.json();
      return {
        data,
        status: response.status,
      };
    } catch (error) {
      console.error('Error parsing response JSON:', error);
      return {
        message: 'Invalid JSON response',
        status: response.status,
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T> | ApiError> {
    try {
      const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
        headers: await this.getHeaders(),
      });
      const result = await this.handleResponse<T>(response);

      // If token was refreshed, retry the request
      if (isRetryableError(result)) {
        return this.get<T>(endpoint);
      }

      return result;
    } catch (error) {
      console.error(`GET ${endpoint} failed:`, error);
      return {
        message: error instanceof Error ? error.message : 'Unknown error',
        status: 500,
      };
    }
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: {
      onProgress?: (progress: { loaded: number; total: number; percentage: number }) => void;
      signal?: AbortSignal;
    },
  ): Promise<ApiResponse<T> | ApiError> {
    try {
      // Check if data is FormData
      const isFormData = data instanceof FormData;

      // Log FormData details for debugging
      if (isFormData) {
        console.log('FormData details:', {
          endpoint,
          formDataEntries: Array.from((data as FormData).entries()).map(([key, value]) => {
            if (value instanceof File) {
              return [
                key,
                {
                  name: value.name,
                  type: value.type,
                  size: value.size,
                },
              ];
            }
            return [key, value];
          }),
        });

        // Always use XMLHttpRequest for FormData uploads
        console.log('Using XMLHttpRequest for FormData upload');
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.open('POST', `${this.config.baseUrl}${endpoint}`);

          // Set headers
          this.getHeaders(isFormData)
            .then((headers) => {
              Object.entries(headers).forEach(([key, value]) => {
                if (value) xhr.setRequestHeader(key, value as string);
              });

              // Track upload progress if callback provided
              if (options?.onProgress) {
                xhr.upload.onprogress = (event) => {
                  if (event.lengthComputable) {
                    options.onProgress?.({
                      loaded: event.loaded,
                      total: event.total,
                      percentage: Math.round((event.loaded / event.total) * 100),
                    });
                  }
                };
              }

              xhr.onload = async () => {
                const response = new Response(xhr.response, {
                  status: xhr.status,
                  statusText: xhr.statusText,
                  headers: new Headers({
                    'Content-Type': xhr.getResponseHeader('Content-Type') || 'application/json',
                  }),
                });

                const result = await this.handleResponse<T>(response);

                // If token was refreshed, retry the request
                if (isRetryableError(result)) {
                  resolve(this.post<T>(endpoint, data, options));
                } else {
                  resolve(result);
                }
              };

              xhr.onerror = () => {
                reject(new Error('Network error occurred'));
              };

              xhr.ontimeout = () => {
                reject(new Error('Request timed out'));
              };

              // Add abort handling if signal provided
              if (options?.signal) {
                options.signal.addEventListener('abort', () => {
                  xhr.abort();
                  reject(new DOMException('The operation was aborted', 'AbortError'));
                });
              }

              // Send the request
              xhr.send(data as FormData);
            })
            .catch((error) => {
              reject(error);
            });
        });
      }

      // For non-FormData requests, use standard fetch
      // Create request options
      const requestOptions: RequestInit = {
        method: 'POST',
        headers: await this.getHeaders(isFormData),
        // Don't stringify FormData objects
        body: data ? (isFormData ? data : JSON.stringify(data)) : undefined,
      };

      // Add abort signal if provided
      if (options?.signal) {
        requestOptions.signal = options.signal;
      }

      // Standard fetch for non-FormData requests
      const response = await fetch(`${this.config.baseUrl}${endpoint}`, requestOptions);
      const result = await this.handleResponse<T>(response);

      // If token was refreshed, retry the request
      if (isRetryableError(result)) {
        return this.post<T>(endpoint, data, options);
      }

      return result;
    } catch (error) {
      console.error(`POST ${endpoint} failed:`, error);
      return {
        message: error instanceof Error ? error.message : 'Unknown error',
        status: 500,
      };
    }
  }

  async put<T>(endpoint: string, data: unknown): Promise<ApiResponse<T> | ApiError> {
    try {
      // Check if data is FormData
      const isFormData = data instanceof FormData;

      const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: await this.getHeaders(isFormData),
        // Don't stringify FormData objects
        body: isFormData ? data : JSON.stringify(data),
      });
      const result = await this.handleResponse<T>(response);

      // If token was refreshed, retry the request
      if (isRetryableError(result)) {
        return this.put<T>(endpoint, data);
      }

      return result;
    } catch (error) {
      console.error(`PUT ${endpoint} failed:`, error);
      return {
        message: error instanceof Error ? error.message : 'Unknown error',
        status: 500,
      };
    }
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T> | ApiError> {
    try {
      const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: await this.getHeaders(),
      });
      const result = await this.handleResponse<T>(response);

      // If token was refreshed, retry the request
      if (isRetryableError(result)) {
        return this.delete<T>(endpoint);
      }

      return result;
    } catch (error) {
      console.error(`DELETE ${endpoint} failed:`, error);
      return {
        message: error instanceof Error ? error.message : 'Unknown error',
        status: 500,
      };
    }
  }
}

export const api = new ApiClient({
  baseUrl: config.apiUrl,
});
