import { ServiceError } from './errors';
export class BaseService {
    constructor() {
        Object.defineProperty(this, "api", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {
                get: async (url) => {
                    const response = await fetch(url);
                    if (!response.ok) {
                        throw new ServiceError('API request failed', 'REQUEST_FAILED');
                    }
                    return response.json();
                },
                post: async (url, data) => {
                    const response = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data),
                    });
                    if (!response.ok) {
                        throw new ServiceError('API request failed', 'REQUEST_FAILED');
                    }
                    return response.json();
                },
                patch: async (url, data) => {
                    const response = await fetch(url, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data),
                    });
                    if (!response.ok) {
                        throw new ServiceError('API request failed', 'REQUEST_FAILED');
                    }
                    return response.json();
                },
                delete: async (url) => {
                    const response = await fetch(url, { method: 'DELETE' });
                    if (!response.ok) {
                        throw new ServiceError('API request failed', 'REQUEST_FAILED');
                    }
                },
            }
        });
    }
    async handleRequest(request) {
        try {
            const data = await request();
            return { data, error: null };
        }
        catch (error) {
            return {
                data: null,
                error: error instanceof Error ? error : new Error('Unknown error'),
            };
        }
    }
}
