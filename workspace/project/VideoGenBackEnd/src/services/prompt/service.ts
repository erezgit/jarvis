import { BaseService } from '../../lib/services/base.service';
import { PromptRepository } from './repository';
import { PromptComponentsByCategory, PromptServiceResult } from './types';
import { logger } from '../../lib/server/logger';

/**
 * Service for prompt component operations
 * Handles business logic for prompt components
 */
export class PromptService extends BaseService {
  private repository: PromptRepository;
  
  /**
   * Initialize the prompt service
   */
  constructor() {
    super(logger, 'PromptService');
    this.repository = new PromptRepository();
  }
  
  /**
   * Get all prompt components grouped by category
   * @returns Promise<PromptServiceResult<PromptComponentsByCategory>> Result with components grouped by category
   */
  async getPromptComponents(): Promise<PromptServiceResult<PromptComponentsByCategory>> {
    try {
      const components = await this.repository.getAllPromptComponents();
      
      // Group components by category
      const componentsByCategory: PromptComponentsByCategory = {};
      
      components.forEach(component => {
        if (!componentsByCategory[component.category]) {
          componentsByCategory[component.category] = [];
        }
        componentsByCategory[component.category].push(component);
      });
      
      return {
        success: true,
        data: componentsByCategory
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
} 