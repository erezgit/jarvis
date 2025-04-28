/**
 * Core types for the prompt selection service
 */

/**
 * Represents a category of prompt options
 */
export interface Category {
  id: string;
  name: string;
  options: PromptOption[];
}

/**
 * Represents a single prompt option within a category
 */
export interface PromptOption {
  id: string;
  text: string;
  category: string;
  imageUrl: string;
  description?: string;
  displayOrder?: number;
}

/**
 * State for prompt selection feature
 */
export interface PromptSelectionState {
  selectedCategory: string | null;
  selectedOptions: Record<string, PromptOption>;
}

/**
 * API response types
 */
export interface PromptCategoryResponse {
  categories: Category[];
  total: number;
}

export interface PromptOptionResponse {
  options: PromptOption[];
  total: number;
}

/**
 * API raw response types
 */
export interface ApiPromptComponentResponse {
  [category: string]: ApiPromptComponent[];
}

export interface ApiPromptComponent {
  id: string;
  name: string;
  description?: string;
  category: string;
  display_order?: number;
  image_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Error types
 */
export type PromptErrorCode =
  | 'CATEGORY_NOT_FOUND'
  | 'INVALID_CATEGORY'
  | 'INVALID_OPTION'
  | 'SERVICE_ERROR'
  | 'NETWORK_ERROR'
  | 'AUTHENTICATION_ERROR';

export class PromptError extends Error {
  constructor(
    message: string,
    public code: PromptErrorCode,
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'PromptError';
  }
}

/**
 * Service options
 */
export interface PromptServiceOptions {
  useMockData?: boolean;
  mockDelay?: number;
}
