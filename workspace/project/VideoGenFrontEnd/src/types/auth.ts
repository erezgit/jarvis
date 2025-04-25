import type { User as SupabaseUser } from '@supabase/supabase-js';
import type {
  AuthUser,
  AuthSession,
  LoginCredentials,
  SignupCredentials,
  AuthError,
} from '@/core/services/auth/types';

// Re-export core types
export type { AuthUser, AuthSession, LoginCredentials, SignupCredentials, AuthError };

// Export User type for backward compatibility
export type User = AuthUser;

// Export AuthResponse for backward compatibility
export interface AuthResponse {
  session: AuthSession | null;
  error?: AuthError;
}

// Export AuthResponseData for backward compatibility
export interface AuthResponseData {
  user: User | null;
  session: AuthSession | null;
}

// Local UI state types
export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error';

export interface AuthState {
  user: AuthUser | null;
  status: AuthStatus;
  error: AuthError | null;
  isAuthenticated: boolean;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

// Type adapter for legacy Supabase user
export const adaptSupabaseUser = (supabaseUser: SupabaseUser): AuthUser => ({
  id: supabaseUser.id,
  email: supabaseUser.email || '',
  name: supabaseUser.user_metadata?.username || null,
});
