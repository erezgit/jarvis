// Remove Buffer import and implement browser-native encoding/decoding
interface StoredTokens {
  access_token: string;
  refresh_token: string;
}

class TokenService {
  private static readonly ACCESS_TOKEN_KEY = 'access_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';

  storeTokens(accessToken: string, refreshToken: string, _expiresIn: number): void {
    const timestamp = new Date().toISOString();
    console.log(`[TokenService][${timestamp}] Storing tokens`);
    
    if (!accessToken) {
      console.error(`[TokenService][${timestamp}] Cannot store null or empty access token`);
      return;
    }
    
    if (!refreshToken) {
      console.error(`[TokenService][${timestamp}] Cannot store null or empty refresh token`);
      return;
    }
    
    console.log(`[TokenService][${timestamp}] Access token length: ${accessToken.length}`);
    console.log(`[TokenService][${timestamp}] Access token first 10 chars: ${accessToken.substring(0, 10)}...`);

    // Store exactly as received
    try {
      sessionStorage.setItem(TokenService.ACCESS_TOKEN_KEY, accessToken);
      sessionStorage.setItem(TokenService.REFRESH_TOKEN_KEY, refreshToken);

      // Verify what was stored
      const storedToken = sessionStorage.getItem(TokenService.ACCESS_TOKEN_KEY);
      console.log(`[TokenService][${timestamp}] Stored token length: ${storedToken ? storedToken.length : 0}`);
      console.log(`[TokenService][${timestamp}] Tokens match: ${storedToken === accessToken}`);
      
      if (storedToken !== accessToken) {
        console.warn(`[TokenService][${timestamp}] MISMATCH DETECTED between original and stored token!`);
      }
      
      console.log(`[TokenService][${timestamp}] Tokens stored successfully`);
    } catch (error) {
      console.error(`[TokenService][${timestamp}] Error storing tokens`, error);
    }
  }

  getAccessToken(): string | null {
    const timestamp = new Date().toISOString();
    console.log(`[TokenService][${timestamp}] Getting access token`);
    try {
      const token = sessionStorage.getItem(TokenService.ACCESS_TOKEN_KEY);
      if (token) {
        console.log(`[TokenService][${timestamp}] Retrieved token length: ${token.length}`);
        console.log(`[TokenService][${timestamp}] Retrieved token first 10 chars: ${token.substring(0, 10)}...`);
        console.log(`[TokenService][${timestamp}] EXACT retrieved token: ${token}`);
        return token;
      } else {
        console.warn(`[TokenService][${timestamp}] No access token found in storage`);
        return null;
      }
    } catch (error) {
      console.error(`[TokenService][${timestamp}] Error retrieving access token`, error);
      return null;
    }
  }

  getRefreshToken(): string | null {
    const timestamp = new Date().toISOString();
    console.log(`[TokenService][${timestamp}] Getting refresh token`);
    try {
      const token = sessionStorage.getItem(TokenService.REFRESH_TOKEN_KEY);
      if (token) {
        console.log(`[TokenService][${timestamp}] Retrieved refresh token length: ${token.length}`);
        console.log(`[TokenService][${timestamp}] Retrieved refresh token first 10 chars: ${token.substring(0, 10)}...`);
        return token;
      } else {
        console.warn(`[TokenService][${timestamp}] No refresh token found in storage`);
        return null;
      }
    } catch (error) {
      console.error(`[TokenService][${timestamp}] Error retrieving refresh token`, error);
      return null;
    }
  }

  clearTokens(): void {
    const timestamp = new Date().toISOString();
    console.log(`[TokenService][${timestamp}] Clearing tokens`);
    try {
      sessionStorage.removeItem(TokenService.ACCESS_TOKEN_KEY);
      sessionStorage.removeItem(TokenService.REFRESH_TOKEN_KEY);
      console.log(`[TokenService][${timestamp}] Tokens cleared successfully`);
    } catch (error) {
      console.error(`[TokenService][${timestamp}] Error clearing tokens`, error);
    }
  }

  hasValidTokens(): boolean {
    const timestamp = new Date().toISOString();
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    const hasTokens = !!(accessToken && refreshToken);
    console.log(`[TokenService][${timestamp}] Has valid tokens: ${hasTokens}`);
    return hasTokens;
  }
}

export const tokenService = new TokenService();
export type { StoredTokens };
