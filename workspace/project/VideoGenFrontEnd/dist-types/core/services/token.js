class TokenService {
    storeTokens(accessToken, refreshToken, expiresIn) {
        sessionStorage.setItem(TokenService.ACCESS_TOKEN_KEY, accessToken);
        sessionStorage.setItem(TokenService.REFRESH_TOKEN_KEY, refreshToken);
        sessionStorage.setItem(TokenService.EXPIRES_IN_KEY, expiresIn.toString());
    }
    getAccessToken() {
        return sessionStorage.getItem(TokenService.ACCESS_TOKEN_KEY);
    }
    getRefreshToken() {
        return sessionStorage.getItem(TokenService.REFRESH_TOKEN_KEY);
    }
    getExpiresIn() {
        const expiresIn = sessionStorage.getItem(TokenService.EXPIRES_IN_KEY);
        return expiresIn ? parseInt(expiresIn, 10) : null;
    }
    clearTokens() {
        sessionStorage.removeItem(TokenService.ACCESS_TOKEN_KEY);
        sessionStorage.removeItem(TokenService.REFRESH_TOKEN_KEY);
        sessionStorage.removeItem(TokenService.EXPIRES_IN_KEY);
    }
    hasValidTokens() {
        const accessToken = this.getAccessToken();
        const refreshToken = this.getRefreshToken();
        const expiresIn = this.getExpiresIn();
        return !!(accessToken && refreshToken && expiresIn);
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
Object.defineProperty(TokenService, "EXPIRES_IN_KEY", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 'expires_in'
});
export const tokenService = new TokenService();
