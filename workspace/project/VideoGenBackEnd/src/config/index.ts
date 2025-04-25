interface AppConfig {
  environment: string;
  runwayApiKey: string | undefined;
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey: string;
  };
  isTest: boolean;
}

export function loadConfig(): AppConfig {
  return {
    environment: process.env.NODE_ENV || 'development',
    runwayApiKey: process.env.RUNWAY_API_KEY,
    supabase: {
      url: process.env.SUPABASE_URL || '',
      anonKey: process.env.SUPABASE_ANON_KEY || '',
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    },
    isTest: process.env.NODE_ENV === 'test'
  };
}

export const config = loadConfig(); 