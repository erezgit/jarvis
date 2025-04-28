class TokenService {
    storeTokens(accessToken, refreshToken, _expiresIn) {
        console.log('TokenService: Storing tokens');
        console.log('EXACT access token:', accessToken);
        // Store exactly as received
        sessionStorage.setItem(TokenService.ACCESS_TOKEN_KEY, accessToken);
        sessionStorage.setItem(TokenService.REFRESH_TOKEN_KEY, refreshToken);
        // Verify what was stored
        const storedToken = sessionStorage.getItem(TokenService.ACCESS_TOKEN_KEY);
        console.log('EXACT stored token:', storedToken);
        console.log('Tokens match:', storedToken === accessToken);
        console.log('TokenService: Tokens stored');
    }
    getAccessToken() {
        console.log('TokenService: Getting access token');
        const token = sessionStorage.getItem(TokenService.ACCESS_TOKEN_KEY);
        if (token) {
            console.log('EXACT retrieved token:', token);
        }
        return token;
    }
    getRefreshToken() {
        console.log('TokenService: Getting refresh token');
        const token = sessionStorage.getItem(TokenService.REFRESH_TOKEN_KEY);
        return token;
    }
    clearTokens() {
        console.log('TokenService: Clearing tokens');
        sessionStorage.removeItem(TokenService.ACCESS_TOKEN_KEY);
        sessionStorage.removeItem(TokenService.REFRESH_TOKEN_KEY);
        console.log('TokenService: Tokens cleared');
    }
    hasValidTokens() {
        const accessToken = this.getAccessToken();
        const refreshToken = this.getRefreshToken();
        return !!(accessToken && refreshToken);
    }
}
Object.defineProperty(TokenService, "ACCESS_TOKEN_KEY", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 'access_token'
});
Object.defineProperty(TokenService, "REFRESH_TOKEN_KEY", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 'refresh_token'
});
export const tokenService = new TokenService();
