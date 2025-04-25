import { createServerSupabase } from '../../lib/supabase';
import { PromptComponent } from './types';

/**
 * Repository for prompt component operations
 * Handles database interactions for prompt components
 */
export class PromptRepository {
  /**
   * Retrieves all prompt components from the database
   * @returns Promise<PromptComponent[]> Array of prompt components
   * @throws Error if database operation fails
   */
  async getAllPromptComponents(): Promise<PromptComponent[]> {
    const supabase = createServerSupabase();
    const { data, error } = await supabase
      .from('prompt_components')
      .select('*')
      .order('display_order', { ascending: true });
      
    if (error) {
      throw new Error(`Failed to fetch prompt components: ${error.message}`);
    }
    
    return data as PromptComponent[];
  }
} 