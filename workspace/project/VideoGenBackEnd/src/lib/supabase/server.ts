import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../../config';
import { AppError } from '../../errors/base';
import { ErrorCode, ErrorSeverity } from '../../types/errors';
import { Database } from './types';

let supabaseServerClient: SupabaseClient<Database> | null = null;

/**
 * Create a Supabase client for server operations
 * This is a singleton to avoid creating multiple connections
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

  if (!supabaseServerClient) {
    supabaseServerClient = createClient<Database>(
      config.supabase.url,
      config.supabase.serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false
        }
      }
    );
  }

  return supabaseServerClient;
} 