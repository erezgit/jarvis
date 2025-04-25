// Hook Error Types
export class HookError extends Error {
    constructor(message, code) {
        super(message);
        Object.defineProperty(this, "code", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: code
        });
        this.name = 'HookError';
    }
}
// Hook-specific errors
export class AuthHookError extends HookError {
    constructor(message) {
        super(message, 'AUTH_HOOK_ERROR');
        this.name = 'AuthHookError';
    }
}
export class FormHookError extends HookError {
    constructor(message) {
        super(message, 'FORM_HOOK_ERROR');
        this.name = 'FormHookError';
    }
}
export class ApiHookError extends HookError {
    constructor(message) {
        super(message, 'API_HOOK_ERROR');
        this.name = 'ApiHookError';
    }
}
export class ProjectHookError extends HookError {
    constructor(message) {
        super(message, 'PROJECT_HOOK_ERROR');
        this.name = 'ProjectHookError';
    }
}
// Error messages
export const ERROR_MESSAGES = {
    auth: {
        NOT_AUTHENTICATED: 'User is not authenticated',
        INVALID_CREDENTIALS: 'Invalid email or password',
        SESSION_EXPIRED: 'Session has expired',
    },
    form: {
        REQUIRED: 'This field is required',
        INVALID_EMAIL: 'Please enter a valid email',
        PASSWORD_MISMATCH: 'Passwords do not match',
    },
    api: {
        REQUEST_FAILED: 'Request failed',
        NETWORK_ERROR: 'Network error occurred',
        TIMEOUT: 'Request timed out',
        RATE_LIMIT: 'Rate limit exceeded',
    },
    projects: {
        FETCH_FAILED: 'Failed to fetch projects',
        NOT_FOUND: 'Project not found',
        UNAUTHORIZED: 'Not authorized to access this project',
        INVALID_FORMAT: 'Invalid project data format',
        VIDEO_LOAD_ERROR: 'Failed to load video',
        VIDEO_PROCESSING: 'Video is still processing',
        RATE_LIMITED: 'Too many requests, please try again later',
        SERVER_ERROR: 'Server error occurred while processing project',
        STALE_DATA: 'Project data is outdated, please refresh',
        DUPLICATE_PROJECT: 'A project with this name already exists',
    },
};
// Error handling utilities
export const createHookError = (type, message) => {
    switch (type) {
        case 'auth':
            return new AuthHookError(message);
        case 'form':
            return new FormHookError(message);
        case 'api':
            return new ApiHookError(message);
        case 'projects':
            return new ProjectHookError(message);
        default:
            return new HookError(message, 'UNKNOWN_HOOK_ERROR');
    }
};
