class TokenService {
  private static readonly ACCESS_TOKEN_KEY = 'access_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private static readonly EXPIRES_IN_KEY = 'expires_in';

  storeTokens(accessToken: string, refreshToken: string, expiresIn: number): void {
    sessionStorage.setItem(TokenService.ACCESS_TOKEN_KEY, accessToken);
    sessionStorage.setItem(TokenService.REFRESH_TOKEN_KEY, refreshToken);
    sessionStorage.setItem(TokenService.EXPIRES_IN_KEY, expiresIn.toString());
  }

  getAccessToken(): string | null {
    return sessionStorage.getItem(TokenService.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return sessionStorage.getItem(TokenService.REFRESH_TOKEN_KEY);
  }

  getExpiresIn(): number | null {
    const expiresIn = sessionStorage.getItem(TokenService.EXPIRES_IN_KEY);
    return expiresIn ? parseInt(expiresIn, 10) : null;
  }

  clearTokens(): void {
    sessionStorage.removeItem(TokenService.ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(TokenService.REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(TokenService.EXPIRES_IN_KEY);
  }

  hasValidTokens(): boolean {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    const expiresIn = this.getExpiresIn();

    return !!(accessToken && refreshToken && expiresIn);
  }
}

export const tokenService = new TokenService();
export type { TokenService };
