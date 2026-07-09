/**
 * Google API authentication — uses only google-auth-library (lightweight).
 * All API calls use direct fetch to Google REST endpoints.
 */

import { JWT } from "google-auth-library";

let _authClient: JWT | null = null;

function getServiceAccountKey(): Record<string, any> {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!raw) {
    throw new Error("مفتاح حساب الخدمة غير موجود. تأكد من إضافة GOOGLE_SERVICE_ACCOUNT_KEY في ملف البيئة.");
  }
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error("تنسيق مفتاح حساب الخدمة غير صالح. تأكد من نسخ JSON كاملاً.");
  }
}

export async function getAuthClient(): Promise<JWT> {
  if (_authClient) return _authClient;

  const key = getServiceAccountKey();

  _authClient = new JWT({
    email: key.client_email,
    key: key.private_key,
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive.file",
    ],
  });

  await _authClient.authorize();
  return _authClient;
}

export async function getAccessToken(): Promise<string> {
  const client = await getAuthClient();
  const token = await client.getAccessToken();
  return token.token || "";
}

export function getSheetId(): string {
  const id = process.env.GOOGLE_SHEET_ID;
  if (!id || id === "your-google-sheet-id-here") {
    throw new Error("معرف Google Sheet غير موجود. تأكد من إضافة GOOGLE_SHEET_ID في ملف البيئة.");
  }
  return id;
}

export function getDriveParentFolderId(): string | null {
  const id = process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID;
  if (!id || id === "your-parent-folder-id-here") return null;
  return id;
}

/** Make an authenticated REST call to any Google API */
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
