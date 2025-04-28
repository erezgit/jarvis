/**
 * @deprecated This file is deprecated. Import from '@/lib/api/adapter' instead.
 */

import { apiAdapter, isApiError as adapterIsApiError } from './api/adapter';
import type { ApiResponse, ApiError } from '@/core/types/api';

// Re-export the adapter as the API client
export const api = apiAdapter;

// Re-export the type guard
export const isApiError = adapterIsApiError;

// Re-export types
export type { ApiResponse, ApiError };
