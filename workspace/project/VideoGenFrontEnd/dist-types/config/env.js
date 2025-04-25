// src/config/env.ts
// Determine environment based on Vite's built-in environment variables
const ACTIVE_ENVIRONMENT = import.meta.env.MODE === 'production' ? 'production' : 'development';
// Environment configuration that uses environment variables from Replit secrets
// No hardcoded values - these will come from Replit secrets
const config = {
    apiUrl: import.meta.env.VITE_API_URL || '',
    wsUrl: import.meta.env.VITE_WS_URL || '',
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    environment: ACTIVE_ENVIRONMENT,
};
// Log configuration (without sensitive values)
console.log('Environment configuration loaded', {
    apiUrl: config.apiUrl ? 'Set' : 'Not set',
    wsUrl: config.wsUrl ? 'Set' : 'Not set',
    hasSupabaseUrl: !!config.supabaseUrl,
    hasSupabaseAnonKey: !!config.supabaseAnonKey,
    environment: config.environment,
});
export { config };
// Production Backend
// export const config = {
//   apiUrl: 'https://video-gen-back-end-erezfern.replit.app',
//   wsUrl: 'wss://video-gen-back-end-erezfern.replit.app',
// };
