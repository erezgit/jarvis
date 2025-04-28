// Built-in modules
import { useCallback } from 'react';
// Internal modules
import { authService } from '@/core/services/auth';
export function useAuth() {
    const login = useCallback(async (credentials) => {
        await authService.login(credentials);
    }, []);
    const signup = useCallback(async (credentials) => {
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
