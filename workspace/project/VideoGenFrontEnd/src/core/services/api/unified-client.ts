import { config } from '@/config/env';
import { supabase } from '@/lib/supabase/client';
import { 
  constructApiUrl, 
  removeDuplicateSlashes, 
  hasDuplicateApiPath,
  removeDuplicateApiPath
} from '@/utils/url';
import type { ApiResponse, ApiError, ApiConfig } from '@/core/types/api';
import { tokenService } from '@/core/services/token/TokenService';

// Type guard to check if a response is an ApiError with shouldRetry property
function isRetryableError(
  response: ApiResponse<unknown> | ApiError,
): response is ApiError & { shouldRetry: boolean } {
  return 'shouldRetry' in response && (response as ApiError).shouldRetry === true;
}

export interface UnifiedApiClientConfig {
  baseUrl: string;
  apiPath?: string;
  debug?: boolean;
}

/**
 * Unified API Client for handling all API requests
 * This is the single source of truth for API URL construction and request handling
 */
export class UnifiedApiClient {
  private baseUrl: string;
  private apiPath: string;
  private debug: boolean;

  constructor(config: UnifiedApiClientConfig) {
    this.baseUrl = config.baseUrl;
    this.apiPath = config.apiPath || '';
    this.debug = config.debug || false;
    
    this.logDebug('UnifiedApiClient initialized', { 
      baseUrl: this.baseUrl,
      apiPath: this.apiPath,
      fullApiUrl: this.getFullApiUrl('')
    });
  }

  /**
   * Constructs a full API URL from the base URL, API path, and endpoint
   * @param endpoint The API endpoint path
   * @returns Full API URL
   */
  public getFullApiUrl(endpoint: string): string {
    // Log the input parameters
    this.logDebug('Constructing API URL', {
      baseUrl: this.baseUrl,
      apiPath: this.apiPath,
      endpoint,
      hasApiPrefix: endpoint.startsWith('/api/') || endpoint.startsWith('api/'),
    });
    
    // Check for duplicate /api/ prefix
    if (endpoint.startsWith('/api/') || endpoint.startsWith('api/')) {
      console.warn('[UnifiedApiClient] Endpoint starts with /api/ which may cause duplicate path segments', {
        endpoint,
        apiPath: this.apiPath,
      });
      
      // Remove the /api/ prefix from the endpoint
      endpoint = endpoint.replace(/^\/?(api\/)/i, '');
      
      this.logDebug('Removed duplicate /api/ prefix from endpoint', { 
        originalEndpoint: endpoint,
        modifiedEndpoint: endpoint 
      });
    }
    
    // Construct the URL
    let url = constructApiUrl(this.baseUrl, this.apiPath, endpoint);
    
    // Check for duplicate API paths
    if (hasDuplicateApiPath(url, this.apiPath)) {
      console.warn('[UnifiedApiClient] URL has duplicate API path segments', { url });
      url = removeDuplicateApiPath(url, this.apiPath);
      this.logDebug('Removed duplicate API path segments', { cleanedUrl: url });
    }
    
    // Remove duplicate slashes
    const cleanUrl = removeDuplicateSlashes(url);
    
    this.logDebug('Final API URL constructed', {
      rawUrl: url,
      cleanUrl,
    });
    
    return cleanUrl;
  }

  /**
   * Logs debug information if debug mode is enabled
   * @param message Debug message
   * @param data Optional data to log
   */
  private logDebug(message: string, data?: any): void {
    if (this.debug) {
      console.log(`[UnifiedApiClient] ${message}`, data);
    }
  }

  /**
   * Gets the headers for an API request
   * @param isFormData Whether the request is a FormData request
   * @returns Headers for the request
   */
  private async getHeaders(isFormData: boolean = false): Promise<HeadersInit> {
    const timestamp = new Date().toISOString();
    console.log(`[UnifiedApiClient][${timestamp}] Getting headers for request, isFormData: ${isFormData}`);
    
    const headers: HeadersInit = {};

    // Only set Content-Type for non-FormData requests
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    // First try to get token from TokenService (primary source)
    console.log(`[UnifiedApiClient][${timestamp}] Attempting to get token from TokenService`);
    const accessToken = tokenService.getAccessToken();
    
    console.log(`[UnifiedApiClient][${timestamp}] TokenService.getAccessToken() returned: ${accessToken ? 'token present' : 'null or undefined'}`);
    
    if (accessToken) {
      // Enhanced token validation and logging
      if (accessToken.length < 10) {
        console.warn(`[UnifiedApiClient][${timestamp}] Token appears to be invalid (too short)`, { tokenLength: accessToken.length });
      } else {
        console.log(`[UnifiedApiClient][${timestamp}] Adding authorization header with TokenService token`, { 
          tokenLength: accessToken.length,
          tokenPresent: true,
          tokenFirstChars: accessToken.substring(0, 10) + '...',
          tokenLastChars: '...' + accessToken.substring(accessToken.length - 10),
          exactToken: accessToken
        });
      }
      
      headers['Authorization'] = `Bearer ${accessToken}`;
      console.log(`[UnifiedApiClient][${timestamp}] Authorization header set successfully`);
      return headers;
    } else {
      console.warn(`[UnifiedApiClient][${timestamp}] No token found in TokenService, falling back to Supabase`, { 
        tokenServiceChecked: true,
        timestamp: new Date().toISOString()
      });
    }
    
    // Fall back to Supabase if TokenService doesn't have a token
    try {
      console.log(`[UnifiedApiClient][${timestamp}] Attempting to get session from Supabase`);
      const { data } = await supabase.auth.getSession();
      if (data?.session?.access_token) {
        console.log(`[UnifiedApiClient][${timestamp}] Adding authorization header with Supabase token`, { 
          tokenLength: data.session.access_token.length,
          tokenSource: 'supabase',
          tokenFirstChars: data.session.access_token.substring(0, 10) + '...',
          tokenLastChars: '...' + data.session.access_token.substring(data.session.access_token.length - 10),
          exactToken: data.session.access_token
        });
        
        headers['Authorization'] = `Bearer ${data.session.access_token}`;
        
        // Store the token in TokenService for future use
        if (data.session.refresh_token) {
          console.log(`[UnifiedApiClient][${timestamp}] Storing Supabase tokens in TokenService`);
          tokenService.storeTokens(
            data.session.access_token,
            data.session.refresh_token,
            data.session.expires_in || 3600
          );
          console.log(`[UnifiedApiClient][${timestamp}] Stored Supabase tokens in TokenService for future use`, {
            accessTokenLength: data.session.access_token.length,
            refreshTokenLength: data.session.refresh_token.length,
            expiresIn: data.session.expires_in || 3600
          });
        }
      } else {
        console.warn(`[UnifiedApiClient][${timestamp}] No token available from Supabase session`, {
          hasSession: !!data?.session,
          sessionExpiry: data?.session?.expires_at ? new Date(data.session.expires_at * 1000).toISOString() : 'none',
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error(`[UnifiedApiClient][${timestamp}] Error getting Supabase session:`, error);
    }

    console.log(`[UnifiedApiClient][${timestamp}] Final headers:`, {
      hasAuthHeader: 'Authorization' in headers,
      headerKeys: Object.keys(headers)
    });
    
    return headers;
  }

  /**
   * Handles API response, including error handling and token refresh
   * @param response The fetch Response object
   * @returns Processed API response or error
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T> | ApiError> {
    // Log the response status and headers
    this.logDebug(`Response received: ${response.status} ${response.statusText}`, {
      url: response.url,
      headers: Object.fromEntries([...response.headers.entries()]),
      contentType: response.headers.get('content-type')
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Let Supabase handle the refresh and redirect
        const { data, error } = await supabase.auth.refreshSession();

        if (data?.session) {
          this.logDebug('Token refreshed successfully via Supabase, will retry the request');
          return {
            message: 'Token refreshed, please retry request',
            status: 401,
            shouldRetry: true,
          };
        } else {
          this.logDebug('Token refresh failed, redirecting to login');
          // Let Supabase handle the sign out
          await supabase.auth.signOut();
          window.location.href = '/login';
        }
      }

      // Try to get more detailed error information from the response
      try {
        // Check content type to determine how to parse the response
        const contentType = response.headers.get('content-type') || '';
        
        if (contentType.includes('application/json')) {
          // Try to parse the response as JSON to get more detailed error information
          const errorData = await response.json();
          console.error('Server error details (JSON):', errorData);

          return {
            message: errorData.message || errorData.error || 'Request failed',
            details: errorData,
            status: response.status,
          };
        } else {
          // If not JSON, get the text
          const errorText = await response.text();
          console.error('Server error details (Text):', errorText);
          
          // Check if this is an HTML response (likely a server error page)
          const isHtml = errorText.trim().startsWith('<!DOCTYPE html>') || 
                         errorText.trim().startsWith('<html') ||
                         errorText.includes('</html>');
          
          return {
            message: isHtml ? 'Server returned HTML instead of JSON. This may indicate a server error or incorrect API URL.' : errorText,
            status: response.status,
            isHtmlResponse: isHtml
          };
        }
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        
        return {
          message: `Failed to parse error response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`,
          status: response.status,
        };
      }
    }

    // Handle successful response
    try {
      // Check content type to determine how to parse the response
      const contentType = response.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        const data = await response.json();
        return { data };
      } else {
        // If not JSON, get the text and log a warning
        const text = await response.text();
        console.warn('Expected JSON response but received:', {
          contentType,
          textLength: text.length,
          textPreview: text.substring(0, 100) + (text.length > 100 ? '...' : '')
        });
        
        // Check if this is an HTML response
        const isHtml = text.trim().startsWith('<!DOCTYPE html>') || 
                       text.trim().startsWith('<html') ||
                       text.includes('</html>');
        
        if (isHtml) {
          return {
            message: 'Server returned HTML instead of JSON. This may indicate a server error or incorrect API URL.',
            status: response.status,
            isHtmlResponse: true
          };
        }
        
        // Try to parse as JSON anyway in case the content-type header is wrong
        try {
          const data = JSON.parse(text);
          console.warn('Successfully parsed response as JSON despite incorrect content-type');
          return { data };
        } catch (jsonError) {
          // If we can't parse as JSON, return the text as an error
          return {
            message: 'Server returned non-JSON response',
            status: response.status,
            details: { responseText: text }
          };
        }
      }
    } catch (error) {
      console.error('Error processing response:', error);
      
      return {
        message: `Failed to process response: ${error instanceof Error ? error.message : 'Unknown error'}`,
        status: response.status,
      };
    }
  }

  /**
   * Performs a GET request to the API
   * @param endpoint The API endpoint path
   * @returns API response or error
   */
  async get<T>(endpoint: string): Promise<ApiResponse<T> | ApiError> {
    const url = this.getFullApiUrl(endpoint);
    this.logDebug(`GET ${url}`);

    try {
      const response = await fetch(url, {
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

  /**
   * Performs a POST request to the API
   * @param endpoint The API endpoint path
   * @param data Request body data
   * @param options Additional options for the request
   * @returns API response or error
   */
  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: {
      onProgress?: (progress: { loaded: number; total: number; percentage: number }) => void;
      signal?: AbortSignal;
    },
  ): Promise<ApiResponse<T> | ApiError> {
    const url = this.getFullApiUrl(endpoint);
    this.logDebug(`POST ${url}`, { data });

    try {
      // Check if data is FormData
      const isFormData = data instanceof FormData;

      // For FormData requests with progress tracking, use XMLHttpRequest
      if (isFormData && options?.onProgress) {
        this.logDebug('Using XMLHttpRequest for FormData upload with progress tracking');
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.open('POST', url);

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

      // For non-FormData requests or FormData without progress tracking, use fetch
      const requestOptions: RequestInit = {
        method: 'POST',
        headers: await this.getHeaders(isFormData),
        body: data ? (isFormData ? data : JSON.stringify(data)) : undefined,
      };

      // Add abort signal if provided
      if (options?.signal) {
        requestOptions.signal = options.signal;
      }

      const response = await fetch(url, requestOptions);
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

  /**
   * Performs a PUT request to the API
   * @param endpoint The API endpoint path
   * @param data Request body data
   * @returns API response or error
   */
  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T> | ApiError> {
    const url = this.getFullApiUrl(endpoint);
    this.logDebug(`PUT ${url}`, { data });

    try {
      // Check if data is FormData
      const isFormData = data instanceof FormData;

      const response = await fetch(url, {
        method: 'PUT',
        headers: await this.getHeaders(isFormData),
        body: data ? (isFormData ? data : JSON.stringify(data)) : undefined,
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

  /**
   * Performs a DELETE request to the API
   * @param endpoint The API endpoint path
   * @returns API response or error
   */
  async delete<T>(endpoint: string): Promise<ApiResponse<T> | ApiError> {
    const url = this.getFullApiUrl(endpoint);
    this.logDebug(`DELETE ${url}`);

    try {
      const response = await fetch(url, {
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