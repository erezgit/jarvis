import { AppUser } from '../../types/auth';

// Authentication Request Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends LoginRequest {
  confirmPassword: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

// Authentication Response Types
export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface AuthResponse {
  user: AppUser | null;
  token?: string;
  session?: AuthSession | null;
  message?: string;
} 