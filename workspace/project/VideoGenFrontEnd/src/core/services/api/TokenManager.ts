/**
 * TokenManager handles all token-related operations including storage, retrieval,
 * and validation of authentication tokens.
 */

export interface TokenPayload {
  exp: number;
  iat: number;
  sub: string;
  [key: string]: unknown;
}

export interface ITokenManager {
  store: (token: string) => void;
  get: () => string | null;
  clear: () => void;
  isExpired: (token: string) => boolean;
  getDecodedToken: () => TokenPayload | null;
}

export interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class TokenManager implements ITokenManager {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly TOKEN_EXPIRY_BUFFER = 60 * 1000; // 1 minute buffer

  /**
   * Stores the authentication token in sessionStorage
   */
  store(token: string): void {
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
  get(): string | null {
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
  clear(): void {
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
  isExpired(token: string): boolean {
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
    } catch {
      return true;
    }
  }

  /**
   * Returns the decoded token payload if available
   */
  getDecodedToken(): TokenPayload | null {
    const token = this.get();
    if (!token) return null;

    try {
      return this.decodeToken(token);
    } catch {
      return null;
    }
  }

  /**
   * Decodes a JWT token and returns its payload
   * @private
   */
  private decodeToken(token: string): TokenPayload {
    const [, payload] = token.split('.');
    if (!payload) {
      throw new Error('Invalid token format');
    }
    return JSON.parse(atob(payload));
  }

  private validateToken(token: string): boolean {
    try {
      if (!token) return false;
      const decodedToken = this.decodeToken(token);
      return !this.isExpired(token) && !!decodedToken.sub;
    } catch {
      return false;
    }
  }

  public async refreshAccessToken(refreshToken: string): Promise<TokenData> {
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
    } catch (error) {
      return this.handleError(error);
    }
  }

  private handleError(error: unknown): never {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unknown error occurred during token operation');
  }

  private async handleTokenRefresh(refreshToken: string): Promise<void> {
    try {
      const newTokens = await this.refreshAccessToken(refreshToken);
      this.store(newTokens.accessToken);
    } catch (error) {
      this.clear(); // Clear invalid tokens
      this.handleError(error);
    }
  }

  private async handleTokenRevocation(token: string): Promise<void> {
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
    } catch (error) {
      this.handleError(error);
    }
  }
}
