import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ErrorCode } from '../types/errors';
import { AppError } from '../errors/base';
import logger from './logger';
import { appConfig } from './app';
import { trackModule, getDependencyChain } from '../utils/module-debug';

// Track this module's loading
trackModule(module);

// Global state tracking with initialization promise
interface SupabaseState {
  isInitialized: boolean;
  processId: number;
  initCount: number;
  lastInitTime: string;
  initStack: string[];
  moduleLoadPath: string[];
  initializationPromise: Promise<void> | null;
}

declare global {
  var __supabaseState: SupabaseState;
}

// Initialize global state if not exists
if (!global.__supabaseState) {
  global.__supabaseState = {
    isInitialized: false,
    processId: process.pid,
    initCount: 0,
    lastInitTime: '',
    initStack: [],
    moduleLoadPath: [],
    initializationPromise: null
  };
}

// Enhanced Debug: Module Loading
logger.info('=== Supabase Module Loading Debug ===', {
  modulePath: module.filename,
  parentModule: module.parent?.filename,
  loadingTimestamp: new Date().toISOString(),
  processId: process.pid,
  globalState: global.__supabaseState,
  dependencyChain: getDependencyChain(module.id)
});

// Track module initialization
const moduleState = {
  loadCount: 0,
  initializationStack: new Error().stack
};
moduleState.loadCount++;

interface SupabaseConfig {
  url: string;
  key: string;
  maxRetries: number;
  retryDelay: number;
  connectionTimeout: number;
  poolSize: number;
}

// Supabase configuration with defaults
export const supabaseConfig: SupabaseConfig = {
  url: process.env.SUPABASE_URL || '',
  key: process.env.SUPABASE_ANON_KEY || '',
  maxRetries: parseInt(process.env.DB_MAX_RETRIES || '3', 10),
  retryDelay: parseInt(process.env.DB_RETRY_DELAY || '1000', 10),
  connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '5000', 10),
  poolSize: parseInt(process.env.DB_POOL_SIZE || '5', 10)
};

// Validate required configuration
if (!supabaseConfig.url || !supabaseConfig.key) {
  throw new Error('Missing required Supabase environment variables');
}

// Connection state management
let isInitialized = false;
let isInitializing = false;

// Connection pool
let clientPool: SupabaseClient[] = [];
let currentPoolIndex = 0;

interface SupabaseError {
  code: ErrorCode;
  message: string;
  status: number;
}

/**
 * Initialize the Supabase connection pool
 * This is now a private function, only called by initializeSupabase
 */
const initializePool = (): void => {
  // Clear existing pool
  clientPool = [];
  currentPoolIndex = 0;

  // Create new connections
  for (let i = 0; i < supabaseConfig.poolSize; i++) {
    const client = createClient(supabaseConfig.url, supabaseConfig.key, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
      }
    });
    clientPool.push(client);
  }

  logger.info(`Supabase connection pool initialized with size ${supabaseConfig.poolSize}`);
};

/**
 * Test connection using a temporary client
 * This is used during initialization to avoid circular dependency
 */
const testInitialConnection = async (): Promise<{ success: boolean; error?: SupabaseError }> => {
  try {
    const tempClient = createClient(supabaseConfig.url, supabaseConfig.key, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
      }
    });
    
    const { data, error } = await tempClient.auth.getSession();
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: ErrorCode.CONNECTION_ERROR,
        message: error.message || 'Unknown error occurred',
        status: 500
      }
    };
  }
};

/**
 * Initialize Supabase connection with atomic state management and promise caching
 */
export const initializeSupabase = async (): Promise<void> => {
  // If already initialized, return immediately
  if (isInitialized) {
    logger.debug('Supabase already initialized (local state), skipping initialization');
    return;
  }

  // If there's a pending initialization, return the existing promise
  if (global.__supabaseState.initializationPromise) {
    logger.debug('Supabase initialization in progress, waiting for completion');
    return global.__supabaseState.initializationPromise;
  }

  // Track initialization attempt
  global.__supabaseState.initCount++;
  global.__supabaseState.lastInitTime = new Date().toISOString();
  global.__supabaseState.initStack.push(new Error().stack || 'No stack trace');

  logger.info('Supabase initialization attempt:', {
    processId: process.pid,
    initCount: global.__supabaseState.initCount,
    globalState: global.__supabaseState.isInitialized,
    localState: isInitialized
  });

  // Create and store the initialization promise
  global.__supabaseState.initializationPromise = (async () => {
    try {
      isInitializing = true;
      logger.info('Starting Supabase initialization...');
      
      // Test connection before pool initialization
      const { success, error } = await testInitialConnection();
      if (!success) {
        throw new Error(error?.message || 'Failed to initialize Supabase connection');
      }
      logger.info('Initial connection test successful');
      
      // Initialize the connection pool
      initializePool();
      
      isInitialized = true;
      global.__supabaseState.isInitialized = true;
      logger.info('Supabase initialization completed successfully', {
        processId: process.pid,
        initCount: global.__supabaseState.initCount
      });
    } catch (error) {
      // Reset state on failure
      isInitialized = false;
      global.__supabaseState.isInitialized = false;
      clientPool = [];
      currentPoolIndex = 0;
      logger.error('Failed to initialize Supabase:', error);
      throw error;
    } finally {
      isInitializing = false;
      global.__supabaseState.initializationPromise = null;
    }
  })();

  return global.__supabaseState.initializationPromise;
};

/**
 * Get a connection from the pool using round-robin
 */
export const getClient = (): SupabaseClient => {
  if (!isInitialized || clientPool.length === 0) {
    throw new Error('Supabase pool not initialized. Call initializeSupabase() first.');
  }

  // Use service role client for database operations
  const client = createClient(supabaseConfig.url, process.env.SUPABASE_SERVICE_ROLE_KEY || '', {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false
    }
  });

  return client;
};

/**
 * Test database connection with retry logic
 */
export const testConnection = async (): Promise<{ success: boolean; error?: SupabaseError }> => {
  // If not initialized, return failure
  if (!isInitialized || clientPool.length === 0) {
    return {
      success: false,
      error: {
        code: ErrorCode.SERVER_ERROR,
        message: 'Supabase connection not initialized',
        status: 503
      }
    };
  }

  let retries = 0;
  while (retries < supabaseConfig.maxRetries) {
    try {
      const client = clientPool[currentPoolIndex];
      currentPoolIndex = (currentPoolIndex + 1) % supabaseConfig.poolSize;
      
      const { data, error } = await client.auth.getSession();
      if (error) throw error;
      
      return { success: true };
    } catch (error: any) {
      retries++;
      logger.warn(`Supabase connection test attempt ${retries} failed: ${error.message}`);

      if (retries < supabaseConfig.maxRetries) {
        await new Promise(resolve => setTimeout(resolve, supabaseConfig.retryDelay));
        continue;
      }

      return {
        success: false,
        error: {
          code: ErrorCode.CONNECTION_ERROR,
          message: error.message || 'Unknown error occurred',
          status: 500
        }
      };
    }
  }

  return {
    success: false,
    error: {
      code: ErrorCode.CONNECTION_ERROR,
      message: `Failed to connect after ${supabaseConfig.maxRetries} attempts`,
      status: 500
    }
  };
};

/**
 * Execute a Supabase operation with retry logic
 */
export const executeWithRetry = async <T>(
  operation: (client: SupabaseClient) => Promise<T>
): Promise<T> => {
  let retries = 0;

  while (retries < supabaseConfig.maxRetries) {
    try {
      const client = getClient();
      return await operation(client);
    } catch (error: any) {
      retries++;
      logger.warn(`Supabase operation attempt ${retries} failed: ${error.message}`);

      if (retries < supabaseConfig.maxRetries) {
        await new Promise(resolve => setTimeout(resolve, supabaseConfig.retryDelay));
        continue;
      }

      throw error;
    }
  }

  throw new Error(`Failed to execute operation after ${supabaseConfig.maxRetries} attempts`);
};

/**
 * Clean up the Supabase connection pool
 */
export const closePool = async (): Promise<void> => {
  try {
    if (!isInitialized) {
      logger.warn('Supabase pool already closed');
      return;
    }

    // Clear all clients
    clientPool.forEach(client => {
      client.auth.signOut(); // Clear any auth state
    });
    clientPool = [];
    currentPoolIndex = 0;
    isInitialized = false;
    logger.info('Supabase connection pool closed');
  } catch (error) {
    logger.error('Error closing Supabase connection pool:', error);
    throw error;
  }
};

// Remove automatic initialization
// Initialize pool on startup if not in test environment
// if (!appConfig.isTest) {
//   initializePool();
// } 