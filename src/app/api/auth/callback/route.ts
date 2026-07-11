import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return new NextResponse(
      `
      <html dir="ltr">
        <head><title>OAuth Error</title>
        <style>
          body { font-family: sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; background: #fef2f2; }
          .error { background: white; padding: 20px; border-radius: 10px; border-left: 4px solid #ef4444; }
          code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; }
        </style>
        </head>
        <body>
          <h1>❌ OAuth Error</h1>
          <div class="error">
            <p><strong>Error:</strong> ${error}</p>
            <p>${searchParams.get("error_description") || ""}</p>
            <p>Try again: <a href="/api/auth/google">/api/auth/google</a></p>
          </div>
        </body>
      </html>
      `,
      { headers: { "Content-Type": "text/html" } }
    );
  }

  if (!code) {
    return new NextResponse(
      `
      <html><body><h1>No code received</h1><p>Missing ?code= parameter</p></body></html>
      `,
      { headers: { "Content-Type": "text/html" }, status: 400 }
    );
  }

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI || 
    `${request.nextUrl.origin}/api/auth/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "OAuth client credentials not configured" },
      { status: 400 }
    );
  }

  try {
    console.log(`[OAuth Callback] Exchanging code for tokens, redirect_uri: ${redirectUri}`);

    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenResponse.json();

    console.log(`[OAuth Callback] Token response status: ${tokenResponse.status}`);
    console.log(`[OAuth Callback] Token response:`, JSON.stringify({ ...tokens, access_token: tokens.access_token ? `${tokens.access_token.substring(0,20)}...` : null }, null, 2));

    if (!tokenResponse.ok) {
      return new NextResponse(
        `
        <html dir="ltr">
          <head><title>Token Exchange Failed</title>
          <style>
            body { font-family: sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; background: #fef2f2; }
            .error { background: white; padding: 20px; border-radius: 10px; border-left: 4px solid #ef4444; white-space: pre-wrap; }
            code { background: #f1f5f9; padding: 10px; display: block; border-radius: 4px; margin: 10px 0; overflow-x: auto; }
          </style>
          </head>
          <body>
            <h1>❌ Failed to exchange code for tokens</h1>
            <div class="error">
              <p><strong>Status:</strong> ${tokenResponse.status}</p>
              <p><strong>Response:</strong></p>
              <code>${JSON.stringify(tokens, null, 2)}</code>
              <p>Common causes:</p>
              <ul>
                <li>Redirect URI mismatch - must exactly match Google Cloud console settings</li>
                <li>Client ID/Secret incorrect</li>
                <li>Code already used (codes are single-use) - <a href="/api/auth/google">try again</a></li>
              </ul>
              <p>Configured redirect URI: <code>${redirectUri}</code></p>
              <p>Make sure this URI is added in Google Cloud Console > APIs & Services > Credentials > OAuth 2.0 Client > Authorized redirect URIs</p>
            </div>
          </body>
        </html>
        `,
        { headers: { "Content-Type": "text/html" }, status: 400 }
      );
    }

    const { access_token, refresh_token, expires_in, scope } = tokens;

    // Important: refresh_token is only returned on first authorization or when prompt=consent
    return new NextResponse(
      `
      <html dir="ltr">
        <head>
          <title>OAuth Success - Save Your Tokens</title>
          <style>
            body { font-family: sans-serif; max-width: 900px; margin: 30px auto; padding: 20px; background: #f0fdf4; }
            .success { background: white; padding: 25px; border-radius: 12px; border-left: 4px solid #10b981; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
            .token-box { background: #1e293b; color: #e2e8f0; padding: 15px; border-radius: 8px; margin: 15px 0; font-family: monospace; word-break: break-all; font-size: 14px; border: 1px solid #334155; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .env-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 13px; margin: 15px 0; }
            code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
            .btn { display: inline-block; background: #0f172a; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; margin: 5px; }
            .btn:hover { background: #1e293b; }
            h2 { color: #0f172a; margin-top: 30px; }
            ul { line-height: 1.8; }
          </style>
        </head>
        <body>
          <h1>✅ OAuth Successful! Save Your Tokens Now</h1>
          
          <div class="success">
            <h2>🔑 Your Tokens:</h2>
            <p><strong>Access Token:</strong> (short-lived, expires in ${expires_in} seconds)</p>
            <div class="token-box">${access_token || "No access token"}</div>
            
            <p><strong>Refresh Token:</strong> (long-lived, save this!)</p>
            ${refresh_token ? `<div class="token-box" style="border-color: #10b981; background: #064e3b;">${refresh_token}</div>` : `<div class="warning"><strong>⚠️ No refresh_token returned!</strong><br>This happens if you already authorized before. Fix:<br>1. Go to <a href="https://myaccount.google.com/permissions" target="_blank">https://myaccount.google.com/permissions</a> and remove access for your app<br>2. <a href="/api/auth/google">Authorize again</a> with prompt=consent (already set)<br>3. You MUST get refresh_token on re-auth</div>`}
            
            <p><strong>Scope:</strong></p>
            <div class="token-box">${scope || "N/A"}</div>

            <div class="warning">
              <strong>⚠️ IMPORTANT: Save refresh_token NOW!</strong><br>
              - Access token expires in 1 hour<br>
              - Refresh token is long-lived and used to get new access tokens automatically<br>
              - If you lose it, you must re-authorize<br>
              - Never share these tokens publicly
            </div>

            <h2>📝 Add to Netlify Environment Variables:</h2>
            <p>Go to Netlify: Site settings > Environment variables > Add:</p>
            <div class="env-box">
GOOGLE_OAUTH_CLIENT_ID=${clientId}<br>
GOOGLE_OAUTH_CLIENT_SECRET=${process.env.GOOGLE_OAUTH_CLIENT_SECRET ? "***hidden*** (use your secret)" : clientSecret || "YOUR_CLIENT_SECRET"}<br>
GOOGLE_OAUTH_REFRESH_TOKEN=${refresh_token || "RE-AUTHORIZE TO GET THIS - see warning above"}<br>
GOOGLE_SHEET_ID=your_sheet_id_here<br>
GOOGLE_DRIVE_PARENT_FOLDER_ID=your_folder_id_optional<br>
            </div>

            <h2>📄 Or create oauth-credentials.json file (for Arena):</h2>
            <p>Create file in project root: <code>oauth-credentials.json</code></p>
            <div class="env-box">
{<br>
&nbsp;&nbsp;"client_id": "${clientId}",<br>
&nbsp;&nbsp;"client_secret": "${process.env.GOOGLE_OAUTH_CLIENT_SECRET ? "YOUR_CLIENT_SECRET_HERE" : clientSecret || "YOUR_SECRET"}",<br>
&nbsp;&nbsp;"refresh_token": "${refresh_token || "YOUR_REFRESH_TOKEN_HERE"}"<br>
}<br>
            </div>

            <h2>🧪 Test Your Setup:</h2>
            <p>
              <a class="btn" href="/api/debug/google-config" target="_blank">Test Google Config</a>
              <a class="btn" href="/loan-application" target="_blank">Test Loan Form</a>
            </p>

            <h2>📚 Next Steps:</h2>
            <ul>
              <li>Copy refresh_token and add to Netlify env vars</li>
              <li>Redeploy site in Netlify (Deploys > Trigger deploy)</li>
              <li>Visit <code>/api/debug/google-config</code> → should show ✅ OAuth credentials + Access token obtained</li>
              <li>Test form submission at <code>/loan-application</code> → 6 images should upload to YOUR personal Drive (no quota issue)</li>
            </ul>

            <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 13px;">
              Generated at ${new Date().toISOString()} | Redirect URI used: ${redirectUri}
            </p>
          </div>
        </body>
      </html>
      `,
      { headers: { "Content-Type": "text/html" } }
    );
  } catch (err: any) {
    console.error("[OAuth Callback] Exception:", err);
    return new NextResponse(
      `
      <html><body>
        <h1>Exception during token exchange</h1>
        <pre>${err.message}\n${err.stack}</pre>
        <p><a href="/api/auth/google">Try again</a></p>
      </body></html>
      `,
      { headers: { "Content-Type": "text/html" }, status: 500 }
    );
  }
}
