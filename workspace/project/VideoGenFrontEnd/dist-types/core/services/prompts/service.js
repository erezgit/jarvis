import { BaseService } from '@/core/services/base/BaseService';
import { PromptMapper } from './mapper';
import { mockCategories, mockDelay } from './mock/data';
import { PromptError } from './types';
/**
 * Service responsible for handling prompt selection operations
 * Follows the singleton pattern and extends BaseService
 */
export class PromptService extends BaseService {
    constructor() {
        super();
        this.log('constructor', 'PromptService initialized');
    }
    /**
     * Gets the singleton instance of PromptService
     */
    static getInstance() {
        if (!PromptService.instance) {
            PromptService.instance = new PromptService();
        }
        return PromptService.instance;
    }
    /**
     * Gets all available prompt categories
     */
    async getCategories() {
        this.log('getCategories', 'Fetching all prompt categories');
        try {
            // Using mock data temporarily
            await mockDelay();
            const response = {
                categories: mockCategories,
                total: mockCategories.length,
            };
            return {
                data: PromptMapper.toCategories(response),
                error: null,
            };
        }
        catch (error) {
            this.log('getCategories', { error }, 'error');
            return {
                data: null,
                error: PromptMapper.toError(error),
            };
        }
    }
    /**
     * Gets options for a specific category
     */
    async getCategoryOptions(categoryId) {
        this.log('getCategoryOptions', { categoryId });
        try {
            await mockDelay();
            const category = mockCategories.find((c) => c.id === categoryId);
            if (!category) {
                throw new PromptError(`Category not found: ${categoryId}`, 'CATEGORY_NOT_FOUND');
            }
            const response = {
                options: category.options,
                total: category.options.length,
            };
            return {
                data: response.options.map((option) => PromptMapper.toOption(option)),
                error: null,
            };
        }
        catch (error) {
            this.log('getCategoryOptions', { error, categoryId }, 'error');
            return {
                data: null,
                error: PromptMapper.toError(error),
            };
        }
    }
}
// Export singleton instance
export const promptService = PromptService.getInstance();
