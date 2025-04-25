/// <reference types="vite/client" />
import { sanitizeJson } from '../../utils/security';
import { tokenService } from './token/TokenService';
import { authService } from './auth';
class RequestQueue {
    constructor() {
        Object.defineProperty(this, "queue", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "processing", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
    }
    async add(request) {
        return new Promise((resolve, reject) => {
            this.queue.push({
                request: request,
                resolve: resolve,
                reject,
            });
            if (!this.processing) {
                this.processQueue();
            }
        });
    }
    async processQueue() {
        if (this.processing || this.queue.length === 0)
            return;
        this.processing = true;
        while (this.queue.length > 0) {
            const { request, resolve, reject } = this.queue.shift();
            try {
                const result = await request();
                resolve(result);
            }
            catch (error) {
                reject(error);
            }
        }
        this.processing = false;
    }
}
class ApiClient {
    constructor(baseUrl) {
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
        Object.defineProperty(this, "requestQueue", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new RequestQueue()
        });
        if (!baseUrl) {
            throw new Error('API base URL is required');
        }
        this.baseUrl = baseUrl;
    }
    setToken(token) {
        console.log('API Client: Setting token:', token ? 'present' : 'missing');
        this.token = token;
    }
    validateTokenStructure(token) {
        try {
            console.log('Validating token structure...');
            // Check basic format
            if (!token) {
                return { isValid: false, error: 'Token is empty' };
            }
            const parts = token.split('.');
            if (parts.length !== 3) {
                return { isValid: false, error: 'Invalid JWT format' };
            }
            // Decode payload
            const payload = JSON.parse(atob(parts[1]));
            console.log('Token payload:', {
                iss: payload.iss,
                aud: payload.aud,
                role: payload.role,
                hasSubject: !!payload.sub,
                hasSessionId: !!payload.session_id,
                expiresIn: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'missing',
            });
            // Validate required claims
            const details = {
                hasIssuer: !!payload.iss,
                hasSubject: !!payload.sub,
                hasAudience: payload.aud === 'authenticated',
                hasRole: payload.role === 'authenticated',
                hasExpiry: !!payload.exp,
                hasSessionId: !!payload.session_id,
                issuerFormat: payload.iss?.endsWith?.('.supabase.co/auth/v1'),
            };
            const isValid = Object.values(details).every(Boolean);
            if (!isValid) {
                console.error('Token validation failed:', details);
                return {
                    isValid: false,
                    error: 'Missing or invalid claims',
                    details,
                };
            }
            // Validate expiration
            const now = Math.floor(Date.now() / 1000);
            if (payload.exp <= now) {
                return { isValid: false, error: 'Token has expired' };
            }
            console.log('Token validation successful');
            return { isValid: true };
        }
        catch (error) {
            console.error('Token validation error:', error);
            return {
                isValid: false,
                error: error instanceof Error ? error.message : 'Token validation failed',
            };
        }
    }
    async executeRequest(path, options = {}) {
        try {
            const url = `${this.baseUrl}${path}`;
            console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
            // Create headers
            const headers = new Headers();
            headers.set('Content-Type', 'application/json');
            headers.set('Accept', 'application/json');
            // Get token from storage if not in memory
            if (!this.token) {
                console.log('No token in memory, checking storage...');
                const storedToken = tokenService.getAccessToken();
                if (storedToken) {
                    console.log('Found token in storage, setting in memory');
                    this.token = storedToken;
                }
            }
            // Add Authorization header if we have a token
            if (this.token && path !== '/auth/login' && path !== '/auth/refresh') {
                console.log('Validating token before request...');
                // Validate token structure
                const validationResult = this.validateTokenStructure(this.token);
                if (!validationResult.isValid) {
                    console.error('Token validation failed:', validationResult);
                    if (validationResult.error === 'Token has expired') {
                        // Attempt token refresh
                        console.log('Token expired, attempting refresh...');
                        const refreshToken = tokenService.getRefreshToken();
                        if (refreshToken) {
                            try {
                                const refreshResult = await authService.refreshToken(refreshToken);
                                if (refreshResult.session.accessToken) {
                                    this.token = refreshResult.session.accessToken;
                                }
                            }
                            catch (refreshError) {
                                console.error('Token refresh failed:', refreshError);
                                tokenService.clearTokens();
                                this.setToken(null);
                                window.location.href = '/login';
                                throw new Error('Session expired');
                            }
                        }
                    }
                    else {
                        // Invalid token structure, clear and redirect
                        console.error('Invalid token structure, clearing session...');
                        tokenService.clearTokens();
                        this.setToken(null);
                        window.location.href = '/login';
                        throw new Error(validationResult.error);
                    }
                }
                // Ensure Bearer prefix
                const tokenValue = this.token ? `Bearer ${this.token}` : '';
                if (tokenValue) {
                    headers.set('Authorization', tokenValue);
                    console.log('Authorization header set successfully');
                }
            }
            // Log request details
            const requestDetails = {
                method: options.method || 'GET',
                headers: Object.fromEntries(headers.entries()),
                body: options.body,
            };
            console.log('Request details:', JSON.stringify(requestDetails, null, 2));
            const response = await fetch(url, {
                ...options,
                headers,
            });
            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', JSON.stringify(data, null, 2));
            // For successful responses, return the data property
            if (response.ok && data.data) {
                return {
                    status: 'success',
                    data: data.data,
                };
            }
            // Handle unauthorized
            if (response.status === 401) {
                console.log('Got 401 response:', {
                    error: data.error,
                    code: data.error?.code,
                    message: data.error?.message,
                });
                switch (data.error?.code) {
                    case 'auth.session_expired':
                        // Token refresh is handled above in validation
                        throw new Error('Session expired');
                    case 'auth.invalid_token':
                    case 'auth.session_missing':
                        console.log('Invalid token or missing session, redirecting to login');
                        tokenService.clearTokens();
                        this.setToken(null);
                        window.location.href = '/login';
                        throw new Error(data.error?.message || 'Authentication failed');
                    default:
                        console.error('Unhandled 401 error:', data.error);
                        tokenService.clearTokens();
                        this.setToken(null);
                        window.location.href = '/login';
                        throw new Error(data.error?.message || 'Authentication failed');
                }
            }
            // Handle other errors
            return {
                status: 'error',
                message: data.error?.message || 'Request failed',
                code: data.error?.code || 'REQUEST_FAILED',
            };
        }
        catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('An unknown error occurred');
        }
    }
    async get(path, options = {}) {
        return this.requestQueue.add(() => this.executeRequest(path, { ...options, method: 'GET' }));
    }
    async post(path, body, options = {}) {
        return this.requestQueue.add(() => this.executeRequest(path, {
            ...options,
            method: 'POST',
            body: JSON.stringify(sanitizeJson(body)),
        }));
    }
    async put(path, body, options = {}) {
        return this.requestQueue.add(() => this.executeRequest(path, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(sanitizeJson(body)),
        }));
    }
    async delete(path, options = {}) {
        return this.requestQueue.add(() => this.executeRequest(path, { ...options, method: 'DELETE' }));
    }
}
export const api = new ApiClient(import.meta.env.VITE_API_URL || 'https://video-gen-back-end-erezfern.replit.app');
