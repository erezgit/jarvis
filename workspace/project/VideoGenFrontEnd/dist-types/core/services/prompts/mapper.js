import { PromptError } from './types';
/**
 * Mapper class for prompt selection responses
 * Handles transformation of API responses to domain types
 */
export class PromptMapper {
    /**
     * Maps raw API response to Category array
     */
    static toCategories(data) {
        if (!data || typeof data !== 'object') {
            throw new PromptError('Invalid categories data', 'SERVICE_ERROR');
        }
        const response = data;
        const categories = Array.isArray(response.categories) ? response.categories : [];
        return categories.map((category) => ({
            id: category.id,
            name: category.name,
            options: Array.isArray(category.options) ? category.options.map(PromptMapper.toOption) : [],
        }));
    }
    /**
     * Maps raw API response to PromptOption
     */
    static toOption(data) {
        if (!data || typeof data !== 'object') {
            throw new PromptError('Invalid option data', 'SERVICE_ERROR');
        }
        const option = data;
        return {
            id: option.id,
            text: option.text,
            category: option.category,
            imageUrl: option.imageUrl || option.image_url || '',
        };
    }
    /**
     * Maps raw API response to PromptCategoryResponse
     */
    static toCategoryResponse(data) {
        if (!data || typeof data !== 'object') {
            throw new PromptError('Invalid category response data', 'SERVICE_ERROR');
        }
        const response = data;
        return {
            categories: PromptMapper.toCategories(response),
            total: response.total || 0,
        };
    }
    /**
     * Maps raw API response to PromptOptionResponse
     */
    static toOptionResponse(data) {
        if (!data || typeof data !== 'object') {
            throw new PromptError('Invalid option response data', 'SERVICE_ERROR');
        }
        const response = data;
        const options = Array.isArray(response.options) ? response.options : [];
        return {
            options: options.map(PromptMapper.toOption),
            total: response.total || 0,
        };
    }
    /**
     * Maps API error to PromptError
     */
    static toError(error) {
        if (error instanceof PromptError) {
            return error;
        }
        if (error instanceof Error) {
            return new PromptError(error.message, 'SERVICE_ERROR');
        }
        if (typeof error === 'string') {
            return new PromptError(error, 'SERVICE_ERROR');
        }
        // Handle API error response
        if (PromptMapper.isApiError(error)) {
            return new PromptError(error.message, PromptMapper.mapErrorCode(error.code), {
                status: error.status,
                code: error.code,
            });
        }
        return new PromptError('Unknown error occurred', 'SERVICE_ERROR');
    }
    /**
     * Maps API error code to PromptErrorCode
     */
    static mapErrorCode(code) {
        switch (code?.toUpperCase()) {
            case 'CATEGORY_NOT_FOUND':
                return 'CATEGORY_NOT_FOUND';
            case 'INVALID_CATEGORY':
                return 'INVALID_CATEGORY';
            case 'INVALID_OPTION':
                return 'INVALID_OPTION';
            default:
                return 'SERVICE_ERROR';
        }
    }
    /**
     * Type guard for API error
     */
    static isApiError(error) {
        return typeof error === 'object' && error !== null && 'message' in error && 'status' in error;
    }
}
