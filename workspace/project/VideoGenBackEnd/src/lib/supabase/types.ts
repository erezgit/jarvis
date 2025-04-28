/**
 * Supabase configuration interface
 */
export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
  maxRetries?: number;
  timeout?: number;
}

/**
 * Supabase client options
 */
export interface SupabaseClientOptions {
  auth: {
    autoRefreshToken: boolean;
    persistSession: boolean;
    detectSessionInUrl: boolean;
  };
}

/**
 * Database types from schema
 */
export interface DbSchema {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          user_id: string;
          image_url: string;
          title: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          image_url: string;
          title?: string | null;
        };
        Update: {
          title?: string | null;
          image_url?: string;
          updated_at?: string;
        };
      };
      generations: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          status: string;
          video_url: string | null;
          prompt: string;
          error_message: string | null;
          model_id: string;
          duration: number | null;
          thumbnail_url: string | null;
          started_at: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
          metadata: Record<string, unknown> | null;
        };
        Insert: {
          project_id: string;
          user_id: string;
          status: string;
          prompt: string;
          metadata?: Record<string, unknown>;
        };
        Update: {
          status?: string;
          video_url?: string | null;
          error_message?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
          updated_at?: string;
          metadata?: Record<string, unknown>;
        };
      };
    };
  };
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = DbSchema; 