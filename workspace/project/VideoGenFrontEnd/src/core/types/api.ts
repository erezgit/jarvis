export interface ApiResponse<T = unknown> {
  data: T;
  status?: number;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  shouldRetry?: boolean;
  details?: Record<string, unknown>; // Additional error details from the server
  isHtmlResponse?: boolean; // Indicates if the response was HTML instead of JSON
}

export interface ApiConfig {
  baseUrl: string;
  timeout?: number;
  retries?: number;
}
