/**
 * driveService.ts
 * Google Drive API v3 + Google Identity Services (GIS) OAuth
 *
 * Flow:
 *  1. User clicks "Save to Drive"
 *  2. GIS pops up Google consent if not yet authorized
 *  3. We get an access token (drive.file scope only — can't read anything else)
 *  4. Upload the .md file to the target folder via Drive API v3 multipart upload
 *  5. Return the web link to the created file
 *
 * The target folder is Erik's NotebookLM movie folder:
 *   https://drive.google.com/drive/u/0/folders/11NvN1fP676iUJpfDahlvFJQjV5uE1W_5
 */

export const DRIVE_FOLDER_ID = '11NvN1fP676iUJpfDahlvFJQjV5uE1W_5';
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';

// ── OAuth client ─────────────────────────────────────────────────────────────
// Replace with your OAuth 2.0 Client ID from:
// console.cloud.google.com → APIs & Services → Credentials → Web Client
// Make sure https://film-architect-curator.web.app is in Authorized JavaScript origins
export const GOOGLE_CLIENT_ID = localStorage.getItem('google_oauth_client_id') || '';

let tokenClient: google.accounts.oauth2.TokenClient | null = null;
let accessToken: string | null = null;
let tokenExpiry: number = 0;

declare global {
  interface Window {
    google: typeof google;
  }
}

/** Load the GIS script if not already present */
function loadGIS(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
    document.head.appendChild(script);
  });
}

/** Initialize (or reuse) the token client */
async function getTokenClient(clientId: string): Promise<google.accounts.oauth2.TokenClient> {
  await loadGIS();
  if (!tokenClient) {
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: DRIVE_SCOPE,
      callback: () => {}, // will be overridden per-request
    });
  }
  return tokenClient;
}

/** Request a fresh access token if we don't have a valid one */
function requestAccessToken(clientId: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const client = await getTokenClient(clientId);
      // Override callback for this specific call
      (client as any).callback = (resp: google.accounts.oauth2.TokenResponse) => {
        if (resp.error) {
          reject(new Error(`OAuth error: ${resp.error}`));
          return;
        }
        accessToken = resp.access_token;
        tokenExpiry = Date.now() + (Number(resp.expires_in) - 60) * 1000;
        resolve(accessToken!);
      };

      // If we have a valid token, skip the popup
      if (accessToken && Date.now() < tokenExpiry) {
        resolve(accessToken);
        return;
      }

      client.requestAccessToken({ prompt: '' });
    } catch (e) {
      reject(e);
    }
  });
}

export interface DriveUploadResult {
  fileId: string;
  webViewLink: string;
  fileName: string;
}

/**
 * Upload a markdown string directly to the target Drive folder.
 * Returns the web link to the newly created file.
 */
export async function uploadMarkdownToDrive(
  markdownContent: string,
  fileName: string,
  clientId: string
): Promise<DriveUploadResult> {
  if (!clientId) {
    throw new Error('NO_CLIENT_ID');
  }

  const token = await requestAccessToken(clientId);

  const metadata = {
    name: fileName,
    mimeType: 'text/markdown',
    parents: [DRIVE_FOLDER_ID],
  };

  // Multipart upload: metadata + file content in one request
  const boundary = 'film_architect_boundary_' + Math.random().toString(36).slice(2);
  const body = [
    `--${boundary}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    JSON.stringify(metadata),
    `--${boundary}`,
    'Content-Type: text/markdown',
    '',
    markdownContent,
    `--${boundary}--`,
  ].join('\r\n');

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink,name',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body,
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Drive upload failed: ${response.status}`);
  }

  const data = await response.json();
  return {
    fileId: data.id,
    webViewLink: data.webViewLink || `https://drive.google.com/file/d/${data.id}/view`,
    fileName: data.name,
  };
}

/** Revoke the current token (sign out) */
export function revokeDriveToken(): void {
  if (accessToken && window.google?.accounts?.oauth2) {
    window.google.accounts.oauth2.revoke(accessToken, () => {});
  }
  accessToken = null;
  tokenExpiry = 0;
  tokenClient = null;
}
