import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../../config';
import { AppError } from '../../errors/base';
import { ErrorCode, ErrorSeverity } from '../../types/errors';
import { Database } from './types';

let supabaseClient: SupabaseClient<Database> | null = null;

/**
 * Create a Supabase client for server operations
 */
export function createServerSupabase(): SupabaseClient<Database> {
  if (!config.supabase.url || !config.supabase.serviceRoleKey) {
    throw new AppError(
      500,
      ErrorCode.SERVICE_INITIALIZATION_FAILED,
      'Missing Supabase configuration',
      ErrorSeverity.ERROR
    );
  }

  if (!supabaseClient) {
    supabaseClient = createClient<Database>(
      config.supabase.url,
      config.supabase.serviceRoleKey,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false
        }
      }
    );
  }

  return supabaseClient;
}

/**
 * Create a Supabase client for public operations
 */
export function createPublicSupabase(): SupabaseClient<Database> {
  if (!config.supabase.url || !config.supabase.anonKey) {
    throw new AppError(
      500,
      ErrorCode.SERVICE_INITIALIZATION_FAILED,
      'Missing Supabase configuration',
      ErrorSeverity.ERROR
    );
  }

  return createClient<Database>(
    config.supabase.url,
    config.supabase.anonKey,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
      }
    }
  );
} 