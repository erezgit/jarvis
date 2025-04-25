import { AuthError, } from './types';
import { isAuthUser, isAuthSession } from './guards';
/**
 * Mapper class for transforming Supabase auth responses to our domain types
 */
export class AuthMapper {
    /**
     * Maps a Supabase session to our AuthSession type
     * @param session - Supabase session object
     * @returns Domain AuthSession object
     * @throws AuthError if session is invalid
     */
    static toAuthSession(session) {
        try {
            const authSession = {
                accessToken: session.access_token,
                refreshToken: session.refresh_token,
                expiresAt: session.expires_at,
                user: session.user ? AuthMapper.toAuthUser(session.user) : undefined,
            };
            // Validate the mapped session
            if (!isAuthSession(authSession)) {
                throw new Error('Invalid session structure');
            }
            return authSession;
        }
        catch (error) {
            throw AuthMapper.toError(error);
        }
    }
    /**
     * Maps a Supabase user to our AuthUser type
     * @param user - Supabase user object
     * @returns Domain AuthUser object
     * @throws AuthError if user is invalid
     */
    static toAuthUser(user) {
        try {
            const authUser = {
                id: user.id,
                email: user.email || '',
                name: user.user_metadata?.name,
            };
            // Validate the mapped user
            if (!isAuthUser(authUser)) {
                throw new Error('Invalid user structure');
            }
            return authUser;
        }
        catch (error) {
            throw AuthMapper.toError(error);
        }
    }
    /**
     * Maps a Supabase auth response to our AuthResponse type
     * @param data - Response data from Supabase
     * @param error - Optional error from Supabase
     * @returns Domain AuthResponse object
     */
    static toAuthResponse(data, error) {
        return {
            session: data.session ? AuthMapper.toAuthSession(data.session) : null,
            error: error ? AuthMapper.toError(error) : undefined,
        };
    }
    /**
     * Maps any error to our AuthError type
     * @param error - Any error object
     * @returns Domain AuthError object
     */
    static toError(error) {
        // Return as is if it's already our error type
        if (error instanceof AuthError) {
            return error;
        }
        // Map Supabase error codes to our error codes
        const errorCode = AuthMapper.mapErrorCode(error);
        const errorMessage = AuthMapper.getErrorMessage(error);
        return new AuthError(errorMessage, errorCode);
    }
    /**
     * Maps error messages to our error codes
     * @private
     */
    static mapErrorCode(error) {
        if (error instanceof Error) {
            const message = error.message.toLowerCase();
            if (message.includes('invalid login credentials') ||
                message.includes('invalid email') ||
                message.includes('invalid password')) {
                return 'INVALID_CREDENTIALS';
            }
            if (message.includes('user not found') ||
                message.includes('no user found') ||
                message.includes('user does not exist')) {
                return 'USER_NOT_FOUND';
            }
            if (message.includes('expired') ||
                message.includes('invalid token') ||
                message.includes('token expired')) {
                return 'SESSION_EXPIRED';
            }
        }
        return 'SERVICE_ERROR';
    }
    /**
     * Extracts a user-friendly error message
     * @private
     */
    static getErrorMessage(error) {
        if (error instanceof Error) {
            return error.message;
        }
        if (typeof error === 'string') {
            return error;
        }
        if (typeof error === 'object' && error !== null && 'message' in error) {
            return String(error.message);
        }
        return 'An unknown error occurred';
    }
}
