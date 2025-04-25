import { getApiClient } from '../api/factory';
export class BaseService {
    constructor() {
        Object.defineProperty(this, "api", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: getApiClient()
        });
        this.log('constructor', `${this.constructor.name} initialized`);
    }
    async handleRequest(request, options = {}) {
        try {
            const response = await request();
            if (this.isApiError(response)) {
                throw new Error(response.message);
            }
            return { data: response.data, error: null };
        }
        catch (error) {
            return {
                data: null,
                error: error instanceof Error ? error : new Error('Unknown error'),
            };
        }
    }
    isApiError(response) {
        return (typeof response === 'object' &&
            response !== null &&
            'message' in response &&
            'status' in response &&
            !('data' in response));
    }
    log(method, data, level = 'info') {
        console[level](`[${this.constructor.name}] ${method}:`, data);
    }
}
// Helper function to check if response is an ApiError
function isApiError(response) {
    return 'message' in response && !('data' in response);
}
