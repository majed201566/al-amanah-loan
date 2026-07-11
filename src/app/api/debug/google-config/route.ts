import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const status = {
      timestamp: new Date().toISOString(),
      authMethod: "OAuth 2.0 (Personal Drive - No Quota Issue)",
      env: {
        has_GOOGLE_OAUTH_CLIENT_ID: !!process.env.GOOGLE_OAUTH_CLIENT_ID,
        has_GOOGLE_OAUTH_CLIENT_SECRET: !!process.env.GOOGLE_OAUTH_CLIENT_SECRET,
        has_GOOGLE_OAUTH_REFRESH_TOKEN: !!process.env.GOOGLE_OAUTH_REFRESH_TOKEN,
        has_GOOGLE_SHEET_ID: !!process.env.GOOGLE_SHEET_ID,
        has_GOOGLE_DRIVE_PARENT_FOLDER_ID: !!process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID,
        GOOGLE_OAUTH_CLIENT_ID_preview: process.env.GOOGLE_OAUTH_CLIENT_ID ? `${process.env.GOOGLE_OAUTH_CLIENT_ID.substring(0, 20)}...` : null,
        GOOGLE_SHEET_ID_preview: process.env.GOOGLE_SHEET_ID ? `${process.env.GOOGLE_SHEET_ID.substring(0, 10)}...` : null,
      },
      files: {
        cwd: process.cwd(),
        checks: [] as any[],
      },
      canLoadOAuth: false,
      canLoadSheetId: false,
      canGetAccessToken: false,
      errors: [] as string[],
    };

    // Check OAuth files
    const possibleOAuthFiles = [
      "oauth-credentials.json",
      "google-oauth-credentials.json",
      "oauth.json",
    ];

    for (const fileName of possibleOAuthFiles) {
      try {
        const filePath = path.join(/*turbopackIgnore: true*/ process.cwd(), fileName);
        const exists = fs.existsSync(filePath);
        if (exists) {
          const stats = fs.statSync(filePath);
          let valid = false;
          let hasClientId = false;
          let hasClientSecret = false;
          let hasRefreshToken = false;
          try {
            const content = fs.readFileSync(filePath, "utf-8");
            const parsed = JSON.parse(content);
            const creds = parsed.web || parsed.installed || parsed;
            hasClientId = !!creds.client_id;
            hasClientSecret = !!creds.client_secret;
            hasRefreshToken = !!creds.refresh_token || !!parsed.refresh_token;
            valid = hasClientId && hasClientSecret && hasRefreshToken;
          } catch {}
          
          status.files.checks.push({
            file: fileName,
            path: filePath,
            exists: true,
            size: stats.size,
            hasClientId,
            hasClientSecret,
            hasRefreshToken,
            valid,
          });

          if (valid) status.canLoadOAuth = true;
        } else {
          status.files.checks.push({
            file: fileName,
            path: filePath,
            exists: false,
          });
        }
      } catch (e: any) {
        status.files.checks.push({
          file: fileName,
          error: e.message,
        });
      }
    }

    // Check sheet ID files
    const possibleSheetFiles = ["google-sheet-id.txt", "sheet-id.txt"];
    for (const fileName of possibleSheetFiles) {
      try {
        const filePath = path.join(/*turbopackIgnore: true*/ process.cwd(), fileName);
        const exists = fs.existsSync(filePath);
        if (exists) {
          const content = fs.readFileSync(filePath, "utf-8").trim();
          status.files.checks.push({
            file: fileName,
            exists: true,
            contentPreview: content.substring(0, 30),
            length: content.length,
          });
          if (content.length > 10) status.canLoadSheetId = true;
        }
      } catch {}
    }

    // Try actual loading via config module
    try {
      const { getSheetId } = await import("@/lib/google/config");
      const sheetId = getSheetId();
      status.canLoadSheetId = true;
      status.files.checks.push({ sheetIdLoaded: true, sheetIdPreview: `${sheetId.substring(0,10)}...` });
    } catch (e: any) {
      status.errors.push(`getSheetId failed: ${e.message}`);
    }

    try {
      const { getConfigStatus } = await import("@/lib/google/config");
      const cfg = getConfigStatus();
      status.files.checks.push({ configStatus: cfg });
      
      if (cfg.hasClientId && cfg.hasClientSecret && cfg.hasRefreshToken) {
        status.canLoadOAuth = true;
      }
    } catch (e: any) {
      status.errors.push(`Config check failed: ${e.message}`);
    }

    // Try to get access token (real test)
    try {
      const { getAccessToken } = await import("@/lib/google/config");
      const token = await getAccessToken();
      status.canGetAccessToken = !!token;
      status.files.checks.push({ accessTokenObtained: true, tokenPreview: token ? `${token.substring(0,20)}...` : null });
    } catch (e: any) {
      status.errors.push(`getAccessToken failed: ${e.message}`);
      status.files.checks.push({ accessTokenError: e.message });
    }

    // Check .env.local
    const envLocalPath = path.join(/*turbopackIgnore: true*/ process.cwd(), ".env.local");
    status.files.checks.push({
      file: ".env.local",
      exists: fs.existsSync(envLocalPath),
      path: envLocalPath,
    });

    return NextResponse.json({
      success: true,
      message: "Google OAuth 2.0 diagnostic",
      ...status,
      instructions: {
        oauth: status.canLoadOAuth || status.canGetAccessToken
          ? "✅ OAuth credentials found and valid"
          : "❌ OAuth credentials NOT found. Set GOOGLE_OAUTH_CLIENT_ID, SECRET, REFRESH_TOKEN env vars OR upload oauth-credentials.json",
        accessToken: status.canGetAccessToken
          ? "✅ Access token obtained via refresh token (OAuth works)"
          : "❌ Failed to get access token - check refresh token validity",
        sheetId: status.canLoadSheetId
          ? "✅ Sheet ID found"
          : "❌ Sheet ID NOT found",
        nextSteps: status.canGetAccessToken && status.canLoadSheetId
          ? [
              "1. ✅ OAuth is working! Personal Drive quota will be used (no 0 quota issue)",
              "2. Make sure Google Sheets API and Drive API enabled",
              "3. Make sure Sheet is owned by same Google account that authorized OAuth",
              "4. If using parent folder, ensure it exists in your personal Drive",
              "5. Test submission at /loan-application - should upload 6 images to your personal Drive",
            ]
          : [
              "1. Follow OAUTH_SETUP_GUIDE.md to get Client ID, Secret, Refresh Token",
              "2. Add to Netlify: Site settings > Environment variables",
              "3. GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, GOOGLE_OAUTH_REFRESH_TOKEN",
              "4. GOOGLE_SHEET_ID, GOOGLE_DRIVE_PARENT_FOLDER_ID (optional)",
              "5. Redeploy and test /api/debug/google-config again",
            ]
      }
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message,
      stack: err.stack,
    }, { status: 500 });
  }
}
