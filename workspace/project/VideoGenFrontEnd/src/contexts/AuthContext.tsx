import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  authService,
  type AuthSession,
  type LoginCredentials,
  type SignupCredentials,
  type AuthResponse,
  type AuthErrorCode,
  type IAuthService,
  AuthError,
  isAuthSession,
  toAuthError,
} from '@/core/services/auth';
import type { ServiceResult } from '@/core/types/service';
import { supabase } from '@/lib/supabase/client';
import { Session } from '@supabase/supabase-js';
import { tokenService } from '@/core/services/token';

// Local state interface
interface AuthState {
  session: AuthSession | null;
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
  error: AuthError | null;
  isAuthenticated: boolean;
}

// Context interface
interface AuthContextType extends Omit<AuthState, 'error'> {
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  signup: (credentials: SignupCredentials) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  error?: AuthError;
}

const initialState: AuthState = {
  session: null,
  status: 'idle',
  error: null,
  isAuthenticated: false,
};

const AuthContext = createContext<AuthContextType>({
  ...initialState,
  login: async () => ({ session: null }),
  signup: async () => ({ session: null }),
  logout: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState);

  const initAuth = useCallback(async () => {
    setState((prev) => ({ ...prev, status: 'loading', error: null }));

    try {
      console.log('AuthContext: Initializing authentication');

      // First try to get the session directly from Supabase
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('AuthContext: Error getting session from Supabase', sessionError);
      } else {
        console.log('AuthContext: Supabase session check', {
          hasSession: !!sessionData.session,
          expiresAt: sessionData.session?.expires_at
            ? new Date(sessionData.session.expires_at * 1000).toISOString()
            : 'n/a',
        });

        // If we have a valid session, use it immediately
        if (sessionData.session) {
          console.log('AuthContext: Valid session found in Supabase, using it');
          setState({
            session: {
              user: {
                id: sessionData.session.user.id,
                email: sessionData.session.user.email || '',
                name: sessionData.session.user.user_metadata?.name || '',
              },
              accessToken: sessionData.session.access_token,
              refreshToken: sessionData.session.refresh_token,
              expiresAt: sessionData.session.expires_at,
            },
            status: 'authenticated',
            error: null,
            isAuthenticated: true,
          });
          return;
        }
      }

      // Fall back to our service if direct check fails
      const authResult = await authService.checkAuth();

      if (authResult.error) {
        console.error('AuthContext: Error checking auth status', authResult.error);
        setState({
          session: null,
          status: 'unauthenticated',
          error:
            authResult.error instanceof AuthError
              ? authResult.error
              : new AuthError('Authentication check failed', 'SERVICE_ERROR'),
          isAuthenticated: false,
        });
        return;
      }

      if (!authResult.data) {
        console.log('AuthContext: No active session found');
        setState({
          session: null,
          status: 'unauthenticated',
          error: null,
          isAuthenticated: false,
        });
        return;
      }

      console.log('AuthContext: Active session found, refreshing');
      const sessionResult = await authService.refreshSession();

      if (sessionResult.error) {
        console.error('AuthContext: Error refreshing session', sessionResult.error);
        setState((prev) => ({ ...prev, error: sessionResult.error ? toAuthError(sessionResult.error) : null }));
        return;
      }

      if (!sessionResult.data) {
        console.log('AuthContext: Session refresh returned no data');
        setState({
          session: null,
          status: 'unauthenticated',
          error: null,
          isAuthenticated: false,
        });
        return;
      }

      console.log('AuthContext: Session successfully restored');
      setState({
        session: sessionResult.data,
        status: 'authenticated',
        error: null,
        isAuthenticated: true,
      });
    } catch (error) {
      console.error('AuthContext: Unexpected error during initialization', error);
      setState({
        session: null,
        status: 'unauthenticated',
        error:
          error instanceof AuthError
            ? error
            : new AuthError('Authentication initialization failed', 'SERVICE_ERROR'),
        isAuthenticated: false,
      });
    }
  }, []);

  // Initialize auth on mount
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Add auth state change listener
  useEffect(() => {
    console.log('AuthContext: Setting up auth state change listener');

    // Use the imported supabase client
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('AuthContext: Auth state changed', {
        event,
        hasSession: !!session,
        timestamp: new Date().toISOString(),
      });

      if (session) {
        // Store tokens in TokenService
        if (session.access_token && session.refresh_token) {
          console.log('AuthContext: Storing tokens in TokenService from auth state change');
          tokenService.storeTokens(
            session.access_token,
            session.refresh_token,
            session.expires_in || 3600
          );
        }

        // Update state with new session
        setState({
          session: {
            user: {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name || '',
            },
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
            expiresAt: session.expires_at,
          },
          status: 'authenticated',
          error: null,
          isAuthenticated: true,
        });
      } else if (event === 'SIGNED_OUT') {
        // Clear tokens from TokenService
        console.log('AuthContext: Clearing tokens in TokenService due to sign out');
        tokenService.clearTokens();

        // Clear state
        setState({
          session: null,
          status: 'unauthenticated',
          error: null,
          isAuthenticated: false,
        });
      }
    });

    return () => {
      console.log('AuthContext: Cleaning up auth state change listener');
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthResponse> => {
    setState((prev) => ({ ...prev, status: 'loading', error: null }));

    const result = await authService.login(credentials);
    if (result.error || !result.data) {
      setState({
        session: null,
        status: 'unauthenticated',
        error: result.error ? toAuthError(result.error) : null,
        isAuthenticated: false,
      });
      return { session: null, error: result.error ? toAuthError(result.error) : undefined };
    }

    const session = result.data;
    if (!isAuthSession(session)) {
      const error = new AuthError('Invalid session format', 'SERVICE_ERROR');
      setState({
        session: null,
        status: 'unauthenticated',
        error,
        isAuthenticated: false,
      });
      return { session: null, error };
    }

    // Store tokens in TokenService
    if (session.accessToken && session.refreshToken) {
      console.log('AuthContext: Storing tokens in TokenService after login');
      tokenService.storeTokens(
        session.accessToken,
        session.refreshToken,
        3600 // Default expiry time
      );
    }

    setState({
      session,
      status: 'authenticated',
      error: null,
      isAuthenticated: true,
    });

    return { session };
  }, []);

  const signup = useCallback(async (credentials: SignupCredentials): Promise<AuthResponse> => {
    setState((prev) => ({ ...prev, status: 'loading', error: null }));

    const result = await authService.signup(credentials);
    if (result.error || !result.data) {
      setState({
        session: null,
        status: 'unauthenticated',
        error: result.error ? toAuthError(result.error) : null,
        isAuthenticated: false,
      });
      return { session: null, error: result.error ? toAuthError(result.error) : undefined };
    }

    const session = result.data;
    if (!isAuthSession(session)) {
      const error = new AuthError('Invalid session format', 'SERVICE_ERROR');
      setState({
        session: null,
        status: 'unauthenticated',
        error,
        isAuthenticated: false,
      });
      return { session: null, error };
    }

    setState({
      session,
      status: 'authenticated',
      error: null,
      isAuthenticated: true,
    });

    return { session };
  }, []);

  const logout = useCallback(async () => {
    setState((prev) => ({ ...prev, status: 'loading', error: null }));

    const result = await authService.logout();
    if (result.error) {
      setState((prev) => ({ ...prev, error: result.error ? toAuthError(result.error) : null }));
      throw result.error;
    }

    setState({
      session: null,
      status: 'unauthenticated',
      error: null,
      isAuthenticated: false,
    });
  }, []);

  const contextValue: AuthContextType = {
    session: state.session,
    status: state.status,
    isAuthenticated: state.isAuthenticated,
    error: state.error ?? undefined,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}
