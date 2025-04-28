/**
 * Configuration validator utility
 * 
 * This utility validates required environment variables and configuration
 * at runtime to catch deployment errors early.
 */

type ValidationResult = {
  isValid: boolean;
  missingVars: string[];
  warnings: string[];
};

/**
 * Validates required environment variables
 * @param requiredVars List of required environment variable names
 * @param optionalVars List of optional but recommended environment variable names
 * @returns Validation result with status and missing variables
 */
export function validateEnvVars(
  requiredVars: string[],
  optionalVars: string[] = []
): ValidationResult {
  const missingVars: string[] = [];
  const warnings: string[] = [];

  // Check required variables
  for (const varName of requiredVars) {
    if (!import.meta.env[varName]) {
      missingVars.push(varName);
    }
  }

  // Check optional variables
  for (const varName of optionalVars) {
    if (!import.meta.env[varName]) {
      warnings.push(`Optional environment variable ${varName} is not set`);
    }
  }

  return {
    isValid: missingVars.length === 0,
    missingVars,
    warnings,
  };
}

/**
 * Validates the application configuration at startup
 * Logs warnings and errors to the console
 */
export function validateAppConfig(): void {
  console.info('Validating application configuration...');

  // Define required and optional environment variables
  const isDev = import.meta.env.DEV || import.meta.env.MODE === 'development';
  
  // Required variables in production, optional in development
  const requiredVars = isDev ? [] : ['VITE_API_URL'];
  
  // Optional variables
  const optionalVars = [
    'VITE_APP_ENV', 
    'VITE_API_URL',
    'VITE_ENABLE_DEBUG_PANEL', 
    'VITE_SUPABASE_URL', 
    'VITE_SUPABASE_ANON_KEY'
  ];

  // Validate environment variables
  const result = validateEnvVars(requiredVars, optionalVars);

  // Log results
  if (!result.isValid) {
    console.error('❌ Missing required environment variables:');
    result.missingVars.forEach(varName => {
      console.error(`  - ${varName}`);
    });
    
    if (isDev) {
      console.info('\nIn development mode, the application will continue, but functionality may be limited.');
    } else {
      console.error('\nIn production mode, these variables must be set in Replit Secrets.');
    }
  }

  // Log warnings
  if (result.warnings.length > 0) {
    console.info('ℹ️ Some optional environment variables are not set:');
    result.warnings.forEach(warning => {
      console.info(`  - ${warning}`);
    });
  }

  // Log success if everything is valid
  if (result.isValid && result.warnings.length === 0) {
    console.info('✅ All environment variables are properly set!');
  }
}

/**
 * Validates server configuration (port, host, etc.)
 * @returns Validation result
 */
export function validateServerConfig(): ValidationResult {
  const warnings: string[] = [];
  const missingVars: string[] = [];

  // Check if PORT is set
  const port = process.env.PORT || import.meta.env.VITE_PORT;
  if (!port) {
    warnings.push('PORT is not set, will use default port 3000');
  }

  return {
    isValid: true, // Always return true to prevent blocking the app
    missingVars,
    warnings,
  };
}

// Export a default function to validate all configuration
export default function validateConfig(): boolean {
  try {
    validateAppConfig();
    validateServerConfig();
    
    // In development, always return true to prevent blocking the app
    if (import.meta.env.DEV || import.meta.env.MODE === 'development') {
      return true;
    }
    
    // In production, check if required variables are set
    const requiredVars = ['VITE_API_URL'];
    const result = validateEnvVars(requiredVars);
    return result.isValid;
  } catch (error) {
    console.error('Configuration validation error:', error);
    return import.meta.env.DEV || import.meta.env.MODE === 'development';
  }
} 