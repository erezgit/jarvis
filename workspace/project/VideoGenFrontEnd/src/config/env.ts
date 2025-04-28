// src/config/env.ts

// CHANGE THIS LINE TO SWITCH ENVIRONMENTS
// Set to 'development' or 'production'
const FORCE_ENVIRONMENT: 'development' | 'production' = 'development';

// Determine environment based on the flag above or Vite's built-in environment variables
const ACTIVE_ENVIRONMENT: 'development' | 'production' = 
  FORCE_ENVIRONMENT || (import.meta.env.MODE === 'production' ? 'production' : 'development');

export interface EnvironmentConfig {
  apiUrl: string;
  apiBaseUrl: string;
  apiPath: string;
  wsUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  environment: 'development' | 'production';
}

// Development configuration
const developmentConfig: EnvironmentConfig = {
  apiUrl: 'https://8017b898-9d28-4fc9-b8f7-70af9e89e9e7-00-1vqm5awvn33r5.pike.replit.dev/api',
  apiBaseUrl: 'https://8017b898-9d28-4fc9-b8f7-70af9e89e9e7-00-1vqm5awvn33r5.pike.replit.dev',
  apiPath: 'api',
  wsUrl: 'wss://8017b898-9d28-4fc9-b8f7-70af9e89e9e7-00-1vqm5awvn33r5.pike.replit.dev',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'your_dev_supabase_url',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'your_dev_supabase_key',
  environment: 'development',
};

// Production configuration
const productionConfig: EnvironmentConfig = {
  apiUrl: 'https://video-gen-back-end-erezfern.replit.app/api',
  apiBaseUrl: 'https://video-gen-back-end-erezfern.replit.app',
  apiPath: 'api',
  wsUrl: 'wss://video-gen-back-end-erezfern.replit.app',
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'your_prod_supabase_url',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'your_prod_supabase_key',
  environment: 'production',
};

// Validate configuration
function validateConfig(config: EnvironmentConfig): EnvironmentConfig {
  // Ensure apiBaseUrl doesn't end with a slash
  if (config.apiBaseUrl.endsWith('/')) {
    config.apiBaseUrl = config.apiBaseUrl.slice(0, -1);
    console.warn('apiBaseUrl should not end with a slash, removing trailing slash:', config.apiBaseUrl);
  }
  
  // Ensure apiPath doesn't start or end with a slash
  if (config.apiPath.startsWith('/')) {
    config.apiPath = config.apiPath.substring(1);
    console.warn('apiPath should not start with a slash, removing leading slash:', config.apiPath);
  }
  
  if (config.apiPath.endsWith('/')) {
    config.apiPath = config.apiPath.slice(0, -1);
    console.warn('apiPath should not end with a slash, removing trailing slash:', config.apiPath);
  }
  
  // Ensure apiUrl is consistent with apiBaseUrl and apiPath
  const expectedApiUrl = `${config.apiBaseUrl}/${config.apiPath}`.replace(/([^:]\/)\/+/g, '$1');
  if (config.apiUrl !== expectedApiUrl) {
    console.warn('apiUrl is inconsistent with apiBaseUrl and apiPath:', {
      apiUrl: config.apiUrl,
      expectedApiUrl,
      apiBaseUrl: config.apiBaseUrl,
      apiPath: config.apiPath,
    });
    
    // Update apiUrl to be consistent
    config.apiUrl = expectedApiUrl;
  }
  
  return config;
}

// Select the configuration based on the active environment
let config: EnvironmentConfig = 
  ACTIVE_ENVIRONMENT === 'production' ? productionConfig : developmentConfig;

// Validate the configuration
config = validateConfig(config);

// Log configuration (without sensitive values)
console.log('Environment configuration loaded', {
  environment: config.environment,
  apiUrl: config.apiUrl,
  apiBaseUrl: config.apiBaseUrl,
  apiPath: config.apiPath,
  wsUrl: config.wsUrl,
  hasSupabaseUrl: !!config.supabaseUrl,
  hasSupabaseAnonKey: !!config.supabaseAnonKey,
});

export { config };

// Production Backend
// export const config = {
//   apiUrl: 'https://video-gen-back-end-erezfern.replit.app',
//   wsUrl: 'wss://video-gen-back-end-erezfern.replit.app',
// };
