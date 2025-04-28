/**
 * Types for the Prompt Components Service
 */

/**
 * Represents a prompt component from the database
 */
export interface PromptComponent {
  id: string;
  name: string;
  description: string;
  category: string;
  display_order: number;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Represents prompt components grouped by category
 */
export interface PromptComponentsByCategory {
  [category: string]: PromptComponent[];
}

/**
 * Standard service result type for prompt service operations
 */
export interface PromptServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
} 