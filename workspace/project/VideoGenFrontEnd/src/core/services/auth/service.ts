import { BaseService } from '../base/BaseService';
import { supabase } from '@/lib/supabase/client';
import { AuthMapper } from './mapper';
import type { ServiceResult } from '@/core/types/service';
import type { ApiResponse } from '@/core/types/api';
import {
  type AuthSession,
  type LoginCredentials,
  type SignupCredentials,
  type AuthResponse,
  type IAuthService,
  AuthError,
} from './types';

/**
 * Authentication service implementation
 * Handles all auth-related operations using Supabase
 */
export class AuthService extends BaseService implements IAuthService {
  private static instance: AuthService;
  private refreshInterval: NodeJS.Timeout | null = null;

  private constructor() {
    super();
    this.setupRefreshInterval();
    this.log('constructor', 'AuthService initialized');
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private setupRefreshInterval(interval: number = 5 * 60 * 1000) {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    this.refreshInterval = setInterval(() => {
      this.refreshSession().catch((error) => {
        this.log('refreshInterval', { error }, 'error');
      });
    }, interval);
  }

  public async login(credentials: LoginCredentials): Promise<ServiceResult<AuthSession>> {
    this.log('login', { email: credentials.email });

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        this.log('login', { error }, 'error');
        throw error;
      }

      if (!data.session) {
        this.log('login', 'Login successful but no session returned', 'error');
        throw new Error('No session returned after successful login');
      }

      // Log session details
      this.log('login', {
        hasAccessToken: !!data.session.access_token,
        expiresAt: data.session.expires_at
          ? new Date(data.session.expires_at * 1000).toISOString()
          : 'n/a',
      });

      return {
        data: AuthMapper.toAuthSession(data.session),
        error: null,
      };
    } catch (error) {
      this.log('login', { error }, 'error');
      throw error;
    }
  }

  public async signup(credentials: SignupCredentials): Promise<ServiceResult<AuthSession>> {
    this.log('signup', { email: credentials.email });
    return this.handleRequest(async () => {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            name: credentials.name,
          },
        },
      });

      if (error) throw error;
      return {
        status: 201,
        data: data.session ? AuthMapper.toAuthSession(data.session) : null,
      } as ApiResponse<AuthSession>;
    });
  }

  public async logout(): Promise<ServiceResult<void>> {
    this.log('logout', 'Logging out user');
    return this.handleRequest(async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return {
        status: 200,
        data: undefined,
      } as ApiResponse<void>;
    });
  }

  public async checkAuth(): Promise<ServiceResult<boolean>> {
    this.log('checkAuth', 'Checking authentication status');

    try {
      // Ask Supabase for the current session
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        this.log('checkAuth', { error }, 'error');
        throw error;
      }

      const isAuthenticated = !!data.session;
      this.log('checkAuth', {
        isAuthenticated,
        sessionExists: !!data.session,
        hasAccessToken: !!data.session?.access_token,
        expiresAt: data.session?.expires_at
          ? new Date(data.session.expires_at * 1000).toISOString()
          : 'n/a',
      });

      return {
        data: isAuthenticated,
        error: null,
      };
    } catch (error) {
      this.log('checkAuth', { error }, 'error');
      throw error;
    }
  }

  public async refreshSession(): Promise<ServiceResult<AuthSession>> {
    this.log('refreshSession', 'Attempting to refresh session');

    try {
      // Refresh with Supabase
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        this.log('refreshSession', { error }, 'error');
        throw error;
      }

      if (!data.session) {
        this.log('refreshSession', 'No session found after refresh attempt', 'info');
        return {
          data: null as unknown as AuthSession,
          error: null,
        };
      }

      this.log('refreshSession', {
        message: 'Session refreshed successfully',
        hasAccessToken: !!data.session.access_token,
        expiresAt: data.session.expires_at
          ? new Date(data.session.expires_at * 1000).toISOString()
          : 'n/a',
      });

      return {
        data: AuthMapper.toAuthSession(data.session),
        error: null,
      };
    } catch (error) {
      this.log('refreshSession', { error }, 'error');
      throw error;
    }
  }

  /**
   * Alias for refreshSession to maintain backward compatibility with legacy implementation
   * @returns A promise resolving to a boolean indicating if the session was restored
   */
  public async restoreSession(): Promise<ServiceResult<boolean>> {
    this.log('restoreSession', 'Alias method called for backward compatibility');
    const result = await this.refreshSession();

    // Convert the AuthSession result to a boolean result
    return {
      data: result.data ? true : null,
      error: result.error,
    };
  }

  public async destroy(): Promise<ServiceResult<void>> {
    this.log('destroy', 'Cleaning up auth service');
    return this.handleRequest(async () => {
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval);
        this.refreshInterval = null;
      }
      await this.logout();
      return {
        status: 200,
        data: undefined,
      } as ApiResponse<void>;
    });
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();
