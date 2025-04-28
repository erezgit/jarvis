import { config } from '@/config/env';
import { ApiClient } from './client';
let apiClientInstance = null;
export function getApiClient() {
    if (!apiClientInstance) {
        console.log('Creating API client instance', { apiUrl: config.apiUrl });
        apiClientInstance = new ApiClient({
            baseUrl: config.apiUrl,
        });
    }
    return apiClientInstance;
}
