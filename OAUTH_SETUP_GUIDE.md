# 🔐 Migration to OAuth 2.0 — Complete Setup Guide (Fixes Service Account Quota)

**Problem Solved:** Service Accounts have 0 Drive quota → `storageQuotaExceeded` error. OAuth 2.0 uploads to YOUR personal Drive (your quota, no 0 quota issue).

---

## 📋 Required Environment Variables (Netlify)

You need **5 variables** in Netlify:

| Variable | Example | Required | Where to get |
|----------|---------|----------|--------------|
| `GOOGLE_OAUTH_CLIENT_ID` | `123...apps.googleusercontent.com` | ✅ Yes | Google Cloud Console |
| `GOOGLE_OAUTH_CLIENT_SECRET` | `GOCSPX-...` | ✅ Yes | Same as above |
| `GOOGLE_OAUTH_REFRESH_TOKEN` | `1//04...` | ✅ Yes | OAuth Playground or `/api/auth/callback` |
| `GOOGLE_SHEET_ID` | `1BxiM...` | ✅ Yes | From Sheet URL |
| `GOOGLE_DRIVE_PARENT_FOLDER_ID` | `1a2B...` | ❌ Optional | Drive folder URL, or empty for root |

**Optional but keep for admin:**
- `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`

---

## 🚀 Step-by-Step Setup (15 minutes)

### Step 1: Create OAuth 2.0 Client ID

1. Go to https://console.cloud.google.com
2. Select your project (same project where you enabled Drive & Sheets APIs)
3. **APIs & Services > Credentials** > **Create Credentials > OAuth client ID**
4. If prompted, configure **OAuth consent screen**:
   - User Type: External
   - App name: Al-Amanah Loan
   - User support email: your email
   - Developer contact: your email
   - Scopes: Add `drive` and `spreadsheets` (or leave empty for now, Playground will request)
   - Test users: Add your Google email (the one that owns Drive & Sheet)
5. **Application type:** Web application
6. **Name:** Al-Amanah OAuth
7. **Authorized JavaScript origins:**
   ```
   https://developers.google.com
   http://localhost:3000
   https://your-site.netlify.app
   ```
   Replace `your-site.netlify.app` with your actual Netlify domain

8. **Authorized redirect URIs:** (CRITICAL - must match exactly)
   ```
   https://developers.google.com/oauthplayground
   http://localhost:3000/api/auth/callback
   https://your-site.netlify.app/api/auth/callback
   ```
   Add all 3. Replace `your-site...` with your Netlify URL.

9. Click **Create** → Copy **Client ID** and **Client Secret** → Save them

### Step 2: Enable APIs

- **APIs & Services > Library**
- Search and Enable:
  - ✅ Google Drive API
  - ✅ Google Sheets API

### Step 3: Get Refresh Token (2 Methods)

#### **Method A: OAuth Playground (Easiest, Recommended)**

1. Go to https://developers.google.com/oauthplayground
2. Click **gear icon** (top right) → Check **"Use your own OAuth credentials"**
3. Enter your **Client ID** and **Client Secret** from Step 1
4. Close gear
5. On left, scroll to:
   - **Drive API v3** → check `https://www.googleapis.com/auth/drive`
   - **Sheets API v4** → check `https://www.googleapis.com/auth/spreadsheets`
   - Or manually enter scopes in input box:
     ```
     https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/spreadsheets
     ```
6. Click **Authorize APIs**
7. Login with **your Google account** that owns the Drive folder and Sheet (very important!)
8. Click **Allow** (you may see "unverified app" warning → click Advanced → Go to Al-Amanah Loan (unsafe) → Allow)
9. Click **Exchange authorization code for tokens**
10. Copy **Refresh token** (starts with `1//0...`) — this is long-lived
11. Copy **Access token** if needed (short-lived, ignore)

**If refresh_token not shown:**
- Go to https://myaccount.google.com/permissions
- Remove access for your app
- Repeat steps 1-10, but ensure gear icon has **"Use your own credentials"** checked and you include `prompt=consent` (Playground does by default)

#### **Method B: Use Your Own Site's OAuth Flow (New, Built-in)**

We added `/api/auth/google` and `/api/auth/callback` routes to your project:

1. Add to Netlify env vars first (temporarily):
   - `GOOGLE_OAUTH_CLIENT_ID` = your client ID
   - `GOOGLE_OAUTH_CLIENT_SECRET` = your client secret
   - `GOOGLE_OAUTH_REDIRECT_URI` = `https://your-site.netlify.app/api/auth/callback`
   - Deploy

2. Visit: `https://your-site.netlify.app/api/auth/google`
3. Login with your Google account that owns Drive/Sheet → Allow
4. You'll be redirected to a page showing **Refresh Token** and instructions
5. Copy refresh_token and add to Netlify env as `GOOGLE_OAUTH_REFRESH_TOKEN`
6. Redeploy

### Step 4: Add Environment Variables to Netlify

1. Netlify Dashboard → Your Site → **Site settings → Environment variables**
2. Click **Add variable** for each:

```
GOOGLE_OAUTH_CLIENT_ID = 1234567890-abc123.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET = GOCSPX-abc123def456
GOOGLE_OAUTH_REFRESH_TOKEN = 1//04abc123...
GOOGLE_SHEET_ID = 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
GOOGLE_DRIVE_PARENT_FOLDER_ID = 1a2B3c4D5e6F7g8H9i0J (optional, or leave empty for root)
```

**How to get Sheet ID:**
- Open Sheet: URL is `https://docs.google.com/spreadsheets/d/1BxiM.../edit`
- Copy part between `/d/` and `/edit`

**How to get Drive Folder ID (optional, recommended):**
- Create folder in YOUR personal Drive (not Shared Drive needed anymore with OAuth!)
- Open folder: URL is `https://drive.google.com/drive/folders/1a2B3c...`
- Copy ID after `/folders/`
- If empty, folders will be created in Drive root

3. **Save** and **Trigger deploy**: Deploys → Trigger deploy → Deploy site

### Step 5: Test

1. After deploy, visit:
   ```
   https://your-site.netlify.app/api/debug/google-config
   ```
   Should show:
   ```json
   {
     "canLoadOAuth": true,
     "canGetAccessToken": true,
     "accessTokenObtained": true,
     "canLoadSheetId": true,
     "authMethod": "OAuth 2.0 (Personal Drive - No Quota Issue)"
   }
   ```

2. If you see ✅, test form:
   - Go to `/loan-application`
   - Fill 6 images + all fields
   - Submit
   - Check Netlify logs (Functions → /api/applications):
     ```
     [Google Config] Access token obtained
     [Drive OAuth] Folder created OK
     [Drive OAuth] Upload SUCCESS
     [Sheets] Append successful
     ```
   - Should redirect to success page
   - Check your personal Drive → New folder with 6 images
   - Check Google Sheet → New row with 6 URLs

---

## 🔧 For Arena Development (Local File Method)

If testing locally in Arena workspace:

Create file `oauth-credentials.json` in project root `al-amanah-loan/`:

```json
{
  "client_id": "YOUR_CLIENT_ID.apps.googleusercontent.com",
  "client_secret": "YOUR_CLIENT_SECRET",
  "refresh_token": "1//YOUR_REFRESH_TOKEN"
}
```

Or create `.env.local`:

```env
GOOGLE_OAUTH_CLIENT_ID=...
GOOGLE_OAUTH_CLIENT_SECRET=...
GOOGLE_OAUTH_REFRESH_TOKEN=1//...
GOOGLE_SHEET_ID=...
GOOGLE_DRIVE_PARENT_FOLDER_ID=...
```

Then `npm run dev` → test at `http://localhost:3000/api/debug/google-config`

---

## ❓ Troubleshooting

**`invalid_grant` when getting access token:**
- Refresh token expired or revoked
- Fix: Go to https://myaccount.google.com/permissions → Remove app access → Re-authorize via Playground → Get new refresh_token → Update env var → Redeploy

**`unauthorized_client`:**
- Client ID/Secret mismatch or redirect URI not whitelisted
- Fix: Check Google Cloud Console > Credentials > OAuth Client > Authorized redirect URIs includes exactly `https://developers.google.com/oauthplayground` and `https://your-site.netlify.app/api/auth/callback`

**`access_denied` or consent screen shows error:**
- Add your Google email to Test Users in OAuth consent screen
- Or publish app (set to Production, but requires verification for sensitive scopes - for internal use, keep in Testing and add test users)

**Drive upload still fails with quota:**
- Should NOT happen with OAuth (uses your personal Drive quota, not 0)
- Check Netlify logs: Should show `[Drive OAuth] Upload SUCCESS`
- If still fails, check Drive API enabled and you have Drive storage space left in https://drive.google.com/settings

**Sheets 404:**
- Ensure Sheet is owned by same Google account that authorized OAuth (the account that gave refresh token)
- Or share Sheet with that account as Editor (if Sheet owned by different account)
- Sheets API must be enabled

**No refresh_token returned in Playground:**
- Must check "Use your own OAuth credentials" in gear icon
- Must click "Authorize APIs" with prompt=consent (Playground does this)
- Remove app access from https://myaccount.google.com/permissions first, then re-auth

---

## 📦 What's Changed in Code

- `src/lib/google/config.ts`: Rewritten from JWT (service account) to OAuth2Client with refresh_token
- `src/lib/google/drive.ts`: Simplified for personal Drive, no Shared Drive quota workaround needed, but keeps supportsAllDrives=true, full logging
- `src/lib/google/sheets.ts`: No change needed, uses same googleApiRequest which now uses OAuth token
- `.env.example`: Updated to OAuth vars
- Added `src/app/api/auth/google` and `/callback` for easy token generation

**Removed:**
- Service account JSON parsing logic
- `GOOGLE_SERVICE_ACCOUNT_KEY` env var (no longer needed)

**Kept:**
- All UI, validation, 6 image fields, Sheets 29 columns, Drive folder structure, error handling, debug endpoint, admin panel, Firebase (if any)

---

## 🔐 Security Notes

- Never commit `oauth-credentials.json` or `.env.local` to GitHub (in .gitignore)
- Refresh token is long-lived, keep secret like password
- Access token is short-lived (1 hour), auto-refreshed via refresh token
- If refresh token leaked, revoke at https://myaccount.google.com/permissions
- In production, use Netlify Environment Variables, not files

---

## ✅ Final Checklist Before Deploy

- [ ] OAuth Client ID created with correct redirect URIs
- [ ] Drive API + Sheets API enabled
- [ ] Refresh token obtained via Playground or /api/auth/callback
- [ ] Netlify env vars: CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN, SHEET_ID, optional DRIVE_FOLDER_ID
- [ ] Sheet owned by same Google account that authorized, or shared as Editor
- [ ] Drive folder (if set) exists and owned by same account
- [ ] Deployed and tested /api/debug/google-config → all ✅
- [ ] Tested /loan-application with 6 images → success → Drive has folder with 6 images → Sheet has row with 6 URLs

---

**After setup, uploads go to YOUR personal Drive (quota = your Drive, e.g., 15GB free), not service account's 0 quota. Sheets writes also use same OAuth account.**

Need help? Check Netlify Functions logs for full error JSON (now logs without truncation).
