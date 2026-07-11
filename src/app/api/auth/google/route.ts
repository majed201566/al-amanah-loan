import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI || 
    `${request.nextUrl.origin}/api/auth/callback`;

  if (!clientId) {
    return NextResponse.json(
      { 
        error: "GOOGLE_OAUTH_CLIENT_ID not configured",
        message: "Add GOOGLE_OAUTH_CLIENT_ID to environment variables"
      },
      { status: 400 }
    );
  }

  const scopes = [
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/spreadsheets",
  ].join(" ");

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", scopes);
  authUrl.searchParams.set("access_type", "offline");
  authUrl.searchParams.set("prompt", "consent"); // Important to get refresh_token every time

  console.log(`[OAuth] Redirecting to Google Auth: ${authUrl.toString().substring(0, 100)}...`);
  console.log(`[OAuth] Redirect URI: ${redirectUri}`);
  console.log(`[OAuth] Scopes: ${scopes}`);

  return NextResponse.redirect(authUrl.toString());
}
