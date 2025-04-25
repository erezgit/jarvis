// Built-in modules
import { useCallback } from 'react';

// Internal modules
import { authService } from '@/core/services/auth';
import type { AuthContextType, LoginCredentials, SignupCredentials } from '@/types/auth';

export function useAuth(): AuthContextType {
  const login = useCallback(async (credentials: LoginCredentials) => {
    await authService.login(credentials);
  }, []);

  const signup = useCallback(async (credentials: SignupCredentials) => {
    await authService.signup(credentials);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
  }, []);

  const checkAuth = useCallback(async () => {
    const result = await authService.restoreSession();
    return result.data ?? false;
  }, []);

  return {
    login,
    signup,
    logout,
    checkAuth,
    user: null, // These should be managed by your auth state
    status: 'idle',
    error: null,
    isAuthenticated: false,
  };
}

export default useAuth;
