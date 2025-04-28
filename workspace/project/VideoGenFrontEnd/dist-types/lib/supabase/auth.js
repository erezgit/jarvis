import { adaptSupabaseUser } from '@/types/auth';
import { supabase } from './client';
import { tokenService } from '@/core/services/token';
import { toAuthError } from '@/core/services/auth/types';
export const adaptUser = (supabaseUser) => adaptSupabaseUser(supabaseUser);
export class SupabaseAuthAdapter {
    constructor(client = supabase) {
        Object.defineProperty(this, "client", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.client = client;
    }
    async login(credentials) {
        try {
            const { data, error } = await this.client.auth.signInWithPassword({
                email: credentials.email,
                password: credentials.password,
            });
            if (error)
                throw error;
            if (!data.user || !data.session) {
                throw new Error('Invalid login response');
            }
            // Store tokens using tokenService
            tokenService.storeTokens(data.session.access_token, data.session.refresh_token, data.session.expires_in);
            const session = {
                accessToken: data.session.access_token,
                refreshToken: data.session.refresh_token,
                user: adaptUser(data.user),
            };
            return { session, error: undefined };
        }
        catch (error) {
            tokenService.clearTokens();
            return {
                session: null,
                error: toAuthError(error instanceof Error ? error : new Error('Login failed')),
            };
        }
    }
    async logout() {
        await this.client.auth.signOut();
        tokenService.clearTokens();
    }
    async checkAuth() {
        const hasValidTokens = tokenService.hasValidTokens();
        if (!hasValidTokens) {
            return false;
        }
        const { data: { session }, } = await this.client.auth.getSession();
        return !!session;
    }
    async refreshSession() {
        const { data, error } = await this.client.auth.refreshSession();
        if (error) {
            tokenService.clearTokens();
            return { session: null, error: toAuthError(error) };
        }
        if (!data.user || !data.session) {
            tokenService.clearTokens();
            return {
                session: null,
                error: toAuthError(new Error('Invalid refresh response'))
            };
        }
        // Update tokens using tokenService
        tokenService.storeTokens(data.session.access_token, data.session.refresh_token, data.session.expires_in);
        const session = {
            accessToken: data.session.access_token,
            refreshToken: data.session.refresh_token,
            user: adaptUser(data.user),
        };
        return { session, error: undefined };
    }
    async signUp(credentials) {
        try {
            const { data, error } = await this.client.auth.signUp({
                email: credentials.email,
                password: credentials.password,
                options: {
                    data: {
                        username: credentials.username,
                    },
                },
            });
            if (error)
                throw error;
            if (!data.user || !data.session) {
                throw new Error('Invalid signup response');
            }
            // Store tokens using tokenService
            tokenService.storeTokens(data.session.access_token, data.session.refresh_token, data.session.expires_in);
            const session = {
                accessToken: data.session.access_token,
                refreshToken: data.session.refresh_token,
                user: adaptUser(data.user),
            };
            return { session, error: undefined };
        }
        catch (error) {
            tokenService.clearTokens();
            return {
                session: null,
                error: toAuthError(error instanceof Error ? error : new Error('Signup failed')),
            };
        }
    }
}
