/**
 * Security utilities for XSS prevention and input sanitization
 */
import { config } from '@/config/env';
const UNSAFE_HTML_CHARS = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
};
/**
 * Escapes HTML special characters in a string to prevent XSS
 */
export const escapeHtml = (str) => {
    return str.replace(/[&<>"'/]/g, (match) => UNSAFE_HTML_CHARS[match]);
};
/**
 * Sanitizes user input by removing potentially dangerous content
 */
export const sanitizeInput = (input) => {
    return input.trim().replace(/<\/?[^>]+(>|$)/g, '');
};
/**
 * Validates and sanitizes an email address
 */
export const sanitizeEmail = (email) => {
    return email.trim().toLowerCase();
};
/**
 * Creates a Content Security Policy header value
 */
export const getCSP = () => {
    const policies = {
        'default-src': ["'self'"],
        'script-src': ["'self'"],
        'style-src': ["'self'", "'unsafe-inline'"],
        'img-src': ["'self'", 'data:', 'https:'],
        'connect-src': [
            "'self'",
            process.env.VITE_API_URL || 'https://video-gen-back-end-erezfern.replit.app',
        ],
        'frame-ancestors': ["'none'"],
        'form-action': ["'self'"],
    };
    return Object.entries(policies)
        .map(([key, values]) => `${key} ${values.join(' ')}`)
        .join('; ');
};
/**
 * Validates a URL to prevent XSS and other injection attacks
 */
export const sanitizeUrl = (url) => {
    const sanitized = url.trim();
    if (sanitized.toLowerCase().startsWith('javascript:')) {
        return '#';
    }
    return sanitized;
};
/**
 * Encodes data for safe insertion into HTML attributes
 */
export const encodeHtmlAttribute = (value) => {
    return value.replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
};
/**
 * Validates and sanitizes file names
 */
export const sanitizeFileName = (fileName) => {
    return fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
};
/**
 * Creates nonce for CSP script-src
 */
export const generateNonce = () => {
    return Math.random().toString(36).substring(2);
};
/**
 * Validates and sanitizes JSON input
 */
export const sanitizeJson = (input) => {
    try {
        const stringified = JSON.stringify(input);
        return JSON.parse(stringified);
    }
    catch {
        return null;
    }
};
/**
 * Security utilities for API requests
 */
// CSRF token storage key
const CSRF_TOKEN_KEY = 'csrf_token';
/**
 * Generate a new CSRF token
 */
export const generateCsrfToken = () => {
    const token = crypto.randomUUID();
    sessionStorage.setItem(CSRF_TOKEN_KEY, token);
    return token;
};
/**
 * Validate a CSRF token against the stored token
 */
export const validateCsrfToken = (token) => {
    const storedToken = sessionStorage.getItem(CSRF_TOKEN_KEY);
    return token === storedToken;
};
/**
 * Get security headers for API requests
 */
export const getSecurityHeaders = () => {
    const headers = new Headers({
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'X-API-URL': config.apiUrl,
    });
    const csrfToken = sessionStorage.getItem(CSRF_TOKEN_KEY);
    if (csrfToken) {
        headers.set('X-CSRF-Token', csrfToken);
    }
    return headers;
};
