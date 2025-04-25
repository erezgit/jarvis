/**
 * Common database result type
 */
export interface DbResult<T> {
  data: T | null;
  error: Error | null;
}

/**
 * Common database metadata
 */
export interface DbMetadata {
  created_at?: string;
  updated_at?: string;
} 