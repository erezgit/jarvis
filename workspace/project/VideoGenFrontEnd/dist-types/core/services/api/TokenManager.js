/**
 * TokenManager handles all token-related operations including storage, retrieval,
 * and validation of authentication tokens.
 */
export class TokenManager {
    /**
     * Stores the authentication token in sessionStorage
     */
    store(token) {
        if (!token) {
            throw new Error('Token is required');
        }
        if (!this.validateToken(token)) {
            throw new Error('Invalid token');
        }
        sessionStorage.setItem(TokenManager.TOKEN_KEY, token);
    }
    /**
     * Retrieves the stored authentication token
     */
    get() {
        const token = sessionStorage.getItem(TokenManager.TOKEN_KEY);
        if (token && this.isExpired(token)) {
            this.clear();
            return null;
        }
        return token;
    }
    /**
     * Removes the stored authentication token
     */
    clear() {
        const token = this.get();
        if (token) {
            void this.handleTokenRevocation(token);
        }
        sessionStorage.removeItem(TokenManager.TOKEN_KEY);
    }
    /**
     * Checks if the given token is expired
     * Returns true if token is expired or invalid
     */
    isExpired(token) {
        try {
            const decodedToken = this.decodeToken(token);
            if (!decodedToken || !decodedToken.exp) {
                return true;
            }
            const isNearExpiry = Date.now() >= decodedToken.exp * 1000 - TokenManager.TOKEN_EXPIRY_BUFFER;
            if (isNearExpiry) {
                const refreshToken = sessionStorage.getItem('refresh_token');
                if (refreshToken) {
                    void this.handleTokenRefresh(refreshToken);
                }
            }
            return isNearExpiry;
        }
        catch {
            return true;
        }
    }
    /**
     * Returns the decoded token payload if available
     */
    getDecodedToken() {
        const token = this.get();
        if (!token)
            return null;
        try {
            return this.decodeToken(token);
        }
        catch {
            return null;
        }
    }
    /**
     * Decodes a JWT token and returns its payload
     * @private
     */
    decodeToken(token) {
        const [, payload] = token.split('.');
        if (!payload) {
            throw new Error('Invalid token format');
        }
        return JSON.parse(atob(payload));
    }
    validateToken(token) {
        try {
            if (!token)
                return false;
            const decodedToken = this.decodeToken(token);
            return !this.isExpired(token) && !!decodedToken.sub;
        }
        catch {
            return false;
        }
    }
    async refreshAccessToken(refreshToken) {
        try {
            if (!refreshToken) {
                throw new Error('Refresh token is required');
            }
            // Make API call to refresh token
            const response = await fetch('/auth/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refresh_token: refreshToken }),
            });
            if (!response.ok) {
                throw new Error('Failed to refresh token');
            }
            const data = await response.json();
            return {
                accessToken: data.access_token,
                refreshToken: data.refresh_token,
                expiresIn: data.expires_in,
            };
        }
        catch (error) {
            return this.handleError(error);
        }
    }
    handleError(error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('An unknown error occurred during token operation');
    }
    async handleTokenRefresh(refreshToken) {
        try {
            const newTokens = await this.refreshAccessToken(refreshToken);
            this.store(newTokens.accessToken);
        }
        catch (error) {
            this.clear(); // Clear invalid tokens
            this.handleError(error);
        }
    }
    async handleTokenRevocation(token) {
        try {
            if (!token) {
                throw new Error('Token is required for revocation');
            }
            // Make API call to revoke token
            const response = await fetch('/auth/revoke', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error('Failed to revoke token');
            }
            this.clear(); // Clear the revoked token
        }
        catch (error) {
            this.handleError(error);
        }
    }
}
Object.defineProperty(TokenManager, "TOKEN_KEY", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 'auth_token'
});
Object.defineProperty(TokenManager, "TOKEN_EXPIRY_BUFFER", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 60 * 1000
}); // 1 minute buffer
