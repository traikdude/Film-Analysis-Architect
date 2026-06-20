/**
 * Minimal TypeScript declarations for Google Identity Services (GIS)
 * and the OAuth2 token response — enough for our Drive upload flow.
 */
declare namespace google {
  namespace accounts {
    namespace oauth2 {
      interface TokenResponse {
        access_token: string;
        expires_in: string;
        error?: string;
        error_description?: string;
      }

      interface TokenClientConfig {
        client_id: string;
        scope: string;
        callback: (response: TokenResponse) => void;
        prompt?: string;
      }

      interface TokenClient {
        requestAccessToken(overrideConfig?: { prompt?: string }): void;
        callback: (response: TokenResponse) => void;
      }

      function initTokenClient(config: TokenClientConfig): TokenClient;
      function revoke(token: string, callback: () => void): void;
    }
  }
}
