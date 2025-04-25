import { injectable } from 'tsyringe';
import { createServerSupabase } from '../../lib/supabase';
import { 
  LoginRequest, 
  RegisterRequest, 
  PasswordResetRequest,
  AuthResponse,
  AppUser,
  UserRole
} from '../../types';
import { AuthenticationError } from '../../errors/auth';
import { ErrorCode } from '../../types/errors';
import { logger } from '../../lib/server/logger';
import { BaseService } from '../../lib/services/base.service';

@injectable()
export class AuthService extends BaseService {
  private supabase = createServerSupabase();

  constructor() {
    super(logger, 'AuthService');
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      if (data.password !== data.confirmPassword) {
        throw new AuthenticationError(
          ErrorCode.PASSWORDS_DO_NOT_MATCH,
          'Passwords do not match'
        );
      }

      const { data: authData, error } = await this.supabase.auth.signUp({
        email: data.email,
        password: data.password
      });

      if (error) {
        throw new AuthenticationError(
          ErrorCode.REGISTRATION_FAILED,
          error.message
        );
      }

      if (!authData.user) {
        return {
          user: null,
          message: 'Confirmation email sent. Please verify your email.'
        };
      }

      return {
        user: {
          id: authData.user.id,
          email: authData.user.email!,
          role: UserRole.USER
        },
        session: authData.session
      };

    } catch (error) {
      this.logger.error('Registration failed:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new AuthenticationError(
        ErrorCode.REGISTRATION_FAILED,
        'Registration failed'
      );
    }
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const { data: authData, error } = await this.supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });

      if (error) {
        throw new AuthenticationError(
          ErrorCode.INVALID_CREDENTIALS,
          'Invalid email or password'
        );
      }

      if (!authData.user) {
        return {
          user: null,
          message: 'Authentication failed'
        };
      }

      return {
        user: {
          id: authData.user.id,
          email: authData.user.email!,
          role: UserRole.USER
        },
        session: authData.session
      };

    } catch (error) {
      this.logger.error('Login failed:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new AuthenticationError(
        ErrorCode.AUTHENTICATION_FAILED,
        'Login failed'
      );
    }
  }

  async logout(): Promise<void> {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) {
        throw new AuthenticationError(
          ErrorCode.AUTHENTICATION_FAILED,
          'Logout failed'
        );
      }
    } catch (error) {
      this.logger.error('Logout failed:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  async requestPasswordReset(data: PasswordResetRequest): Promise<AuthResponse> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(
        data.email
      );

      if (error) {
        throw new AuthenticationError(
          ErrorCode.AUTHENTICATION_FAILED,
          'Password reset request failed'
        );
      }

      return {
        user: null,
        message: 'Password reset email sent'
      };

    } catch (error) {
      this.logger.error('Password reset request failed:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new AuthenticationError(
        ErrorCode.AUTHENTICATION_FAILED,
        'Password reset request failed'
      );
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const { data, error } = await this.supabase.auth.refreshSession({
        refresh_token: refreshToken
      });

      if (error) {
        throw new AuthenticationError(
          ErrorCode.AUTHENTICATION_FAILED,
          'Token refresh failed'
        );
      }

      if (!data.user) {
        return {
          user: null,
          message: 'Token refresh failed'
        };
      }

      return {
        user: {
          id: data.user.id,
          email: data.user.email!,
          role: UserRole.USER
        },
        session: data.session
      };

    } catch (error) {
      this.logger.error('Token refresh failed:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new AuthenticationError(
        ErrorCode.AUTHENTICATION_FAILED,
        'Token refresh failed'
      );
    }
  }
} 