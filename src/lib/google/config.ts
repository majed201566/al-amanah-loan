/**
 * Google API authentication - OAuth 2.0 Version
 * 
 * Migrated from Service Account (which has 0 Drive quota) to OAuth 2.0
 * Now uploads directly to user's personal Google Drive (quota = user's Drive)
 * 
 * Required Environment Variables:
 * - GOOGLE_OAUTH_CLIENT_ID
 * - GOOGLE_OAUTH_CLIENT_SECRET
 * - GOOGLE_OAUTH_REFRESH_TOKEN
 * - GOOGLE_SHEET_ID
 * - GOOGLE_DRIVE_PARENT_FOLDER_ID (optional)
 * 
 * OAuth flow uses refresh token to get access token automatically
 */

import { OAuth2Client } from "google-auth-library";
import fs from "fs";
import path from "path";

let _oauthClient: OAuth2Client | null = null;
let _cachedSheetId: string | null = null;

// ── Get OAuth2 Client ──
function getOAuth2Client(): OAuth2Client {
  if (_oauthClient) return _oauthClient;

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET?.trim();
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN?.trim();
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI?.trim() || "https://developers.google.com/oauthplayground";

  // Try to load from file as fallback (for Arena file upload support)
  let finalClientId = clientId;
  let finalClientSecret = clientSecret;
  let finalRefreshToken = refreshToken;

  // If env vars missing, try to load from oauth-credentials.json file
  if (!finalClientId || !finalClientSecret || !finalRefreshToken) {
    const possibleFiles = [
      path.join(/*turbopackIgnore: true*/ process.cwd(), "oauth-credentials.json"),
      path.join(/*turbopackIgnore: true*/ process.cwd(), "google-oauth-credentials.json"),
      path.join(/*turbopackIgnore: true*/ process.cwd(), "oauth.json"),
      "/home/user/al-amanah-loan/oauth-credentials.json",
      "/home/user/al-amanah-loan/google-oauth-credentials.json",
    ];

    for (const filePath of possibleFiles) {
      try {
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, "utf-8").trim();
          const parsed = JSON.parse(content);
          // Support both {client_id, client_secret, refresh_token} and {web: {...}} format
          const creds = parsed.web || parsed.installed || parsed;
          if (creds.client_id && !finalClientId) finalClientId = creds.client_id;
          if (creds.client_secret && !finalClientSecret) finalClientSecret = creds.client_secret;
          if (creds.refresh_token && !finalRefreshToken) finalRefreshToken = creds.refresh_token;
          // Also support refresh_token at top level
          if (parsed.refresh_token && !finalRefreshToken) finalRefreshToken = parsed.refresh_token;
          
          if (finalClientId && finalClientSecret && finalRefreshToken) {
            console.log(`[Google Config] Loaded OAuth credentials from file: ${filePath}`);
            break;
          }
        }
      } catch (err: any) {
        console.warn(`[Google Config] Failed to read ${filePath}: ${err.message}`);
      }
    }
  }

  // Final validation
  const missing: string[] = [];
  if (!finalClientId) missing.push("GOOGLE_OAUTH_CLIENT_ID");
  if (!finalClientSecret) missing.push("GOOGLE_OAUTH_CLIENT_SECRET");
  if (!finalRefreshToken) missing.push("GOOGLE_OAUTH_REFRESH_TOKEN");

  if (missing.length > 0) {
    throw new Error(
      `OAuth 2.0 credentials missing: ${missing.join(", ")}

REQUIRED ENVIRONMENT VARIABLES FOR OAUTH 2.0:

1. GOOGLE_OAUTH_CLIENT_ID - From Google Cloud Console > APIs & Services > Credentials > OAuth 2.0 Client ID
   Example: 1234567890-abc123def456.apps.googleusercontent.com

2. GOOGLE_OAUTH_CLIENT_SECRET - Same place as Client ID
   Example: GOCSPX-abc123def456ghi789

3. GOOGLE_OAUTH_REFRESH_TOKEN - Obtained via OAuth Playground or custom flow
   Example: 1//04abc123def456...

OPTIONAL:
- GOOGLE_OAUTH_REDIRECT_URI - Default: https://developers.google.com/oauthplayground
- GOOGLE_SHEET_ID - Your Google Sheet ID
- GOOGLE_DRIVE_PARENT_FOLDER_ID - Parent folder ID in your personal Drive

SETUP INSTRUCTIONS (see OAUTH_SETUP_GUIDE.md for full guide):

1. Go to https://console.cloud.google.com > APIs & Services > Credentials
2. Create OAuth 2.0 Client ID (Application type: Web application)
   - Authorized redirect URIs: 
     - https://developers.google.com/oauthplayground
     - http://localhost:3000/api/auth/callback (for custom flow)
     - https://your-netlify-site.netlify.app/api/auth/callback
3. Enable APIs: Google Drive API + Google Sheets API (Library)
4. Get Refresh Token via OAuth Playground:
   - Go to https://developers.google.com/oauthplayground
   - Click gear icon (top right) > Check "Use your own OAuth credentials" > Enter Client ID & Secret
   - Select scopes:
     * https://www.googleapis.com/auth/drive (for Drive uploads to your personal Drive)
     * https://www.googleapis.com/auth/spreadsheets (for Sheets)
   - Click Authorize APIs > Login with your Google account (the one that owns Drive & Sheet) > Allow
   - Click Exchange authorization code for tokens
   - Copy refresh_token (starts with 1//...)
5. Add to Netlify: Site settings > Environment variables > Add:
   - GOOGLE_OAUTH_CLIENT_ID = your_client_id
   - GOOGLE_OAUTH_CLIENT_SECRET = your_client_secret
   - GOOGLE_OAUTH_REFRESH_TOKEN = your_refresh_token
   - GOOGLE_SHEET_ID = your_sheet_id
   - GOOGLE_DRIVE_PARENT_FOLDER_ID = your_folder_id (optional, or leave empty for root)
6. Redeploy

ALTERNATIVE: File upload method (Arena):
- Create file oauth-credentials.json in project root with:
  {
    "client_id": "YOUR_CLIENT_ID",
    "client_secret": "YOUR_CLIENT_SECRET",
    "refresh_token": "YOUR_REFRESH_TOKEN"
  }
- Project will auto-detect it

Current status:
- Has Client ID: ${!!finalClientId}
- Has Client Secret: ${!!finalClientSecret}
- Has Refresh Token: ${!!finalRefreshToken}
- Has Sheet ID: ${!!process.env.GOOGLE_SHEET_ID}
- Has Drive Folder ID: ${!!process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID}
`
    );
  }

  console.log("[Google Config] Creating OAuth2 client with Client ID:", finalClientId!.substring(0, 20) + "...");

  const oAuth2Client = new OAuth2Client(
    finalClientId!,
    finalClientSecret!,
    redirectUri
  );

  oAuth2Client.setCredentials({
    refresh_token: finalRefreshToken!,
  });

  // Handle token refresh errors
  oAuth2Client.on('tokens', (tokens) => {
    if (tokens.refresh_token) {
      console.log("[Google Config] New refresh token received (should save):", tokens.refresh_token.substring(0, 20) + "...");
    }
    console.log("[Google Config] Access token refreshed, expiry:", tokens.expiry_date);
  });

  _oauthClient = oAuth2Client;
  return oAuth2Client;
}

export async function getAuthClient(): Promise<OAuth2Client> {
  return getOAuth2Client();
}

export async function getAccessToken(): Promise<string> {
  try {
    const client = getOAuth2Client();
    console.log("[Google Config] Getting access token via refresh token...");
    const { token, res } = await client.getAccessToken();
    
    if (!token) {
      const status = res?.status;
      const data = res?.data;
      console.error(`[Google Config] Failed to get access token - Status: ${status}, Data:`, JSON.stringify(data, null, 2));
      throw new Error(`Failed to get access token - Status: ${status}, Data: ${JSON.stringify(data)}, Possible causes: refresh token expired, client ID/secret incorrect, or OAuth consent revoked. Re-generate refresh token via OAuth Playground.`);
    }

    console.log(`[Google Config] Access token obtained: ${token.substring(0, 20)}... (length: ${token.length})`);
    return token;
  } catch (err: any) {
    console.error(`[Google Config] getAccessToken exception:`, err.message);
    console.error(`[Google Config] Stack:`, err.stack);
    console.error(`[Google Config] Full error:`, JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
    
    // Provide helpful error for common OAuth issues
    let helpMsg = err.message;
    if (err.message?.includes("invalid_grant")) {
      helpMsg += `\n\ninvalid_grant means refresh token is expired or revoked. Fix:
1. Go to https://myaccount.google.com/permissions and remove access for your OAuth client
2. Go to https://developers.google.com/oauthplayground
3. Use your own OAuth credentials (gear icon), re-authorize with drive + spreadsheets scopes
4. Exchange code for tokens, copy new refresh_token
5. Update GOOGLE_OAUTH_REFRESH_TOKEN env var and redeploy`;
    }
    if (err.message?.includes("unauthorized_client")) {
      helpMsg += `\n\nunauthorized_client means OAuth client not configured correctly. Check:
- Client ID and Secret match exactly (no extra spaces)
- OAuth consent screen configured
- Redirect URI https://developers.google.com/oauthplayground added to Authorized redirect URIs`;
    }

    throw new Error(`OAuth getAccessToken failed: ${helpMsg}`);
  }
}

export function getSheetId(): string {
  if (_cachedSheetId) return _cachedSheetId;

  let id = process.env.GOOGLE_SHEET_ID?.trim();

  if (!id) {
    id = process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID?.trim() || process.env.SHEET_ID?.trim();
  }

  // Try file fallback
  if (!id || id === "your-google-sheet-id-here" || id.includes("...")) {
    const possibleFiles = [
      process.env.GOOGLE_SHEET_ID_PATH,
      path.join(/*turbopackIgnore: true*/ process.cwd(), "google-sheet-id.txt"),
      path.join(/*turbopackIgnore: true*/ process.cwd(), "sheet-id.txt"),
      "/home/user/al-amanah-loan/google-sheet-id.txt",
    ].filter(Boolean) as string[];

    for (const filePath of possibleFiles) {
      try {
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, "utf-8").trim();
          const urlMatch = content.match(/\/d\/([a-zA-Z0-9-_]+)/);
          if (urlMatch) {
            id = urlMatch[1];
          } else if (content.length > 10 && !content.includes(" ")) {
            id = content.split("\n")[0].trim();
          }
          if (id) {
            console.log(`[Google Config] Loaded Sheet ID from file: ${filePath}`);
            break;
          }
        }
      } catch {}
    }
  }

  if (id && id.includes("/")) {
    const match = id.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match) id = match[1];
  }

  if (!id || id === "your-google-sheet-id-here" || id.includes("...") || id.length < 10) {
    throw new Error(
      `GOOGLE_SHEET_ID missing. Add env var GOOGLE_SHEET_ID with your Sheet ID (from URL https://docs.google.com/spreadsheets/d/{ID}/edit) or create file google-sheet-id.txt`
    );
  }

  _cachedSheetId = id.trim();
  console.log(`[Google Config] Sheet ID loaded: ${_cachedSheetId.substring(0, 10)}...`);
  return _cachedSheetId;
}

export function getDriveParentFolderId(): string | null {
  let id = process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID?.trim();

  if (!id) {
    const possibleFiles = [
      path.join(/*turbopackIgnore: true*/ process.cwd(), "google-drive-folder-id.txt"),
      path.join(/*turbopackIgnore: true*/ process.cwd(), "drive-folder-id.txt"),
    ];
    for (const filePath of possibleFiles) {
      try {
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, "utf-8").trim();
          if (content.length > 5) {
            id = content.split("\n")[0].trim();
            const urlMatch = id.match(/\/folders\/([a-zA-Z0-9-_]+)/);
            if (urlMatch) id = urlMatch[1];
            if (id) break;
          }
        }
      } catch {}
    }
  }

  if (!id || id === "your-parent-folder-id-here" || id.includes("...")) {
    console.log("[Google Config] No parent folder ID configured, will use Drive root (your personal Drive)");
    return null;
  }
  
  if (id.includes("/")) {
    const match = id.match(/\/folders\/([a-zA-Z0-9-_]+)/) || id.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match) id = match[1];
  }

  console.log(`[Google Config] Drive parent folder ID: ${id.substring(0, 10)}...`);
  return id.trim();
}

export async function googleApiRequest(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getAccessToken();
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };
  return fetch(url, { ...options, headers });
}

// For diagnostics
export function getConfigStatus() {
  const hasClientId = !!process.env.GOOGLE_OAUTH_CLIENT_ID;
  const hasClientSecret = !!process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const hasRefreshToken = !!process.env.GOOGLE_OAUTH_REFRESH_TOKEN;
  const hasSheetId = !!process.env.GOOGLE_SHEET_ID;
  const hasDriveFolder = !!process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID;

  const oauthFiles = [
    "oauth-credentials.json",
    "google-oauth-credentials.json",
    "oauth.json",
  ].filter((f) => {
    try {
      return fs.existsSync(path.join(/*turbopackIgnore: true*/ process.cwd(), f));
    } catch {
      return false;
    }
  });

  return {
    authMethod: "OAuth 2.0 (personal Drive, no quota issue)",
    hasClientId,
    hasClientSecret,
    hasRefreshToken,
    hasSheetId,
    hasDriveFolder,
    oauthFilesFound: oauthFiles,
    cwd: process.cwd(),
    clientIdPreview: process.env.GOOGLE_OAUTH_CLIENT_ID ? `${process.env.GOOGLE_OAUTH_CLIENT_ID.substring(0, 20)}...` : null,
    sheetIdPreview: process.env.GOOGLE_SHEET_ID ? `${process.env.GOOGLE_SHEET_ID.substring(0, 10)}...` : null,
  };
}
