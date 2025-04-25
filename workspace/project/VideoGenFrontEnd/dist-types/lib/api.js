import { config } from '@/config/env';
import { tokenService } from '@/core/services/token';
export const isApiError = (response) => {
    return (Boolean(response) &&
        typeof response.message === 'string' &&
        typeof response.status === 'number');
};
class ApiService {
    constructor(baseUrl = config.apiUrl) {
        Object.defineProperty(this, "baseUrl", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "token", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        if (!baseUrl) {
            throw new Error('API base URL is required');
        }
        this.baseUrl = baseUrl;
        console.log('=== API SERVICE INITIALIZED ===', { baseUrl });
    }
    setToken(token) {
        this.token = token;
    }
    getHeaders(body) {
        const headers = {};
        // Only set Content-Type if not FormData
        if (!(body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }
        // Get token from tokenService or instance
        const token = this.token || tokenService.getAccessToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    }
    async handleResponse(response) {
        console.log('=== API RESPONSE RECEIVED ===', {
            url: response.url,
            status: response.status,
            ok: response.ok,
            headers: Object.fromEntries(response.headers.entries()),
        });
        let responseData;
        try {
            responseData = await response.json();
            console.log('=== Raw Response Data ===', responseData);
        }
        catch (e) {
            console.error('=== Response Parse Error ===', e);
            return {
                message: 'Failed to parse server response',
                status: response.status,
            };
        }
        if (!response.ok) {
            console.error('=== API ERROR ===', {
                status: response.status,
                responseData,
                url: response.url,
            });
            // Handle 401 errors
            if (response.status === 401) {
                tokenService.clearTokens();
                window.location.href = '/login';
            }
            return {
                message: responseData.error || responseData.message || 'An unexpected error occurred',
                status: response.status,
            };
        }
        // Handle different response formats
        const data = responseData.data || responseData;
        console.log('=== API SUCCESS ===', {
            url: response.url,
            originalData: responseData,
            processedData: data,
        });
        return {
            data: data,
            status: response.status,
        };
    }
    async get(endpoint) {
        console.log('=== API GET REQUEST ===', {
            url: `${this.baseUrl}${endpoint}`,
            headers: this.getHeaders(),
        });
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'GET',
            headers: this.getHeaders(),
        });
        return this.handleResponse(response);
    }
    async post(endpoint, body) {
        const headers = this.getHeaders(body);
        const url = `${this.baseUrl}${endpoint}`;
        console.log('=== API POST REQUEST ===', {
            url,
            baseUrl: this.baseUrl,
            endpoint,
            headers,
            isFormData: body instanceof FormData,
        });
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
        });
        return this.handleResponse(response);
    }
    async put(endpoint, body) {
        const headers = this.getHeaders(body);
        console.log('=== API PUT REQUEST ===', {
            url: `${this.baseUrl}${endpoint}`,
            headers,
            isFormData: body instanceof FormData,
        });
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'PUT',
            headers,
            body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
        });
        return this.handleResponse(response);
    }
    async delete(endpoint) {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'DELETE',
            headers: this.getHeaders(),
        });
        return this.handleResponse(response);
    }
}
export const api = new ApiService();
