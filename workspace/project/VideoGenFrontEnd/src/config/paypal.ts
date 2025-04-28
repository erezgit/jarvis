import { config } from '@/config/env';

/**
 * PayPal Configuration
 * 
 * This module provides configuration for PayPal integration based on the current environment.
 * It uses environment variables for client IDs with fallbacks for development.
 */
export const paypalConfig = {
  /**
   * PayPal Client ID
   * Uses environment variables with fallbacks:
   * - VITE_PAYPAL_CLIENT_ID_LIVE for production
   * - VITE_PAYPAL_CLIENT_ID_SANDBOX for development
   */
  clientId: config.environment === 'production'
    ? import.meta.env.VITE_PAYPAL_CLIENT_ID_LIVE || 'PRODUCTION_CLIENT_ID_PLACEHOLDER'
    : import.meta.env.VITE_PAYPAL_CLIENT_ID_SANDBOX || 'AaV4wvSOsPdK2Ypgz5B_njXwjBVJJsK29hwyvrxZh5VbvAnXqJC0Y6rF8tK3ZNkFFbnBG_ecLvYDNMm9',
  
  /**
   * Currency code for PayPal transactions
   */
  currency: 'USD',
  
  /**
   * Whether to use the sandbox environment
   */
  sandbox: config.environment !== 'production',
  
  /**
   * Debug mode to enable verbose logging
   */
  debug: true,
  
  /**
   * PayPal SDK URL
   */
  sdkUrl: 'https://www.paypal.com/sdk/js',
  
  /**
   * Button style configuration
   */
  buttonStyle: {
    layout: 'vertical' as const,
    color: 'gold' as const,
    shape: 'rect' as const,
    label: 'pay' as const
  }
};

// Development fallbacks for use when environment variables are not set
const DEV_FALLBACKS = {
  // Production client ID - should be updated via environment variable
  PRODUCTION_CLIENT_ID: 'PRODUCTION_CLIENT_ID_PLACEHOLDER',
  
  // Sandbox client ID for development - default to our verified sandbox account
  SANDBOX_CLIENT_ID: 'AaV4wvSOsPdK2Ypgz5B_njXwjBVJJsK29hwyvrxZh5VbvAnXqJC0Y6rF8tK3ZNkFFbnBG_ecLvYDNMm9'
}; 