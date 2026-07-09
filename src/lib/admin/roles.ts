/**
 * Multi-admin role-based auth.
 *
 * Roles:
 *   super_admin — full access, can manage other admins, settings, backup, exports
 *   admin       — manage applications, view stats, add notes
 *   reviewer    — view applications, change status (approve/reject/review), add notes
 *
 * Users stored in a dedicated "Admins" sheet tab:
 *   A: username   B: password_hash   C: role   D: display_name   E: created_at
 */

import { cookies } from "next/headers";
import { getSheetId, googleApiRequest } from "@/lib/google/config";

export type AdminRole = "super_admin" | "admin" | "reviewer";

export interface AdminUser {
  username: string;
  role: AdminRole;
  displayName: string;
  createdAt: string;
}

const SESSION_NAME = "ad_session";
const SESSION_MAX_AGE = 60 * 60 * 8;

const SHEETS_BASE = "https://sheets.googleapis.com/v4/spreadsheets";

// ── Permission matrix ──
const rolePermissions: Record<AdminRole, string[]> = {
  super_admin: ["*"],
  admin: ["view_stats", "manage_apps", "approve", "reject", "review", "add_note", "edit_app", "view_docs", "export", "view_activities"],
  reviewer: ["view_stats", "view_apps", "approve", "reject", "review", "add_note", "view_docs", "view_activities"],
};

export function hasPermission(role: AdminRole, permission: string): boolean {
  const perms = rolePermissions[role];
  return perms.includes("*") || perms.includes(permission);
}

// ── Session (HMAC) ──
async function hmacSign(data: string): Promise<string> {
  const secret = process.env.ADMIN_SESSION_SECRET || "dev-secret-change-me";
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function createAdminToken(user: AdminUser): Promise<string> {
  const payload = JSON.stringify({ ...user, exp: Date.now() + SESSION_MAX_AGE * 1000 });
  const sig = await hmacSign(payload);
  return `${Buffer.from(payload).toString("base64url")}.${sig}`;
}

export async function verifyAdminToken(token: string): Promise<AdminUser | null> {
  try {
    const [payloadB64, sigHex] = token.split(".");
    if (!payloadB64 || !sigHex) return null;
    const payloadStr = Buffer.from(payloadB64, "base64url").toString();
    const payload = JSON.parse(payloadStr);
    if (payload.exp && payload.exp < Date.now()) return null;
    const valid = await hmacSign(payloadStr).then(s => s === sigHex);
    if (!valid) return null;
    return { username: payload.username, role: payload.role, displayName: payload.displayName, createdAt: payload.createdAt };
  } catch { return null; }
}

export async function getAdminFromCookies(): Promise<AdminUser | null> {
  try {
    const c = await cookies();
    const token = c.get(SESSION_NAME)?.value;
    if (!token) return null;
    return verifyAdminToken(token);
  } catch { return null; }
}

export function sessionCookie(token: string) {
  return { name: SESSION_NAME, value: token, httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge: SESSION_MAX_AGE };
}

// ── Admin users (from Sheets or fallback) ──
async function loadAdminsFromSheets(): Promise<AdminUser[]> {
  try {
    const sheetId = getSheetId();
    const res = await googleApiRequest(`${SHEETS_BASE}/${sheetId}/values/Admins!A2:E`);
    if (!res.ok) return [];
    const json = await res.json();
    const rows: string[][] = json.values || [];
    return rows.filter(r => r[0]).map(r => ({ username: r[0], role: (r[2] || "reviewer") as AdminRole, displayName: r[3] || r[0], createdAt: r[4] || "" }));
  } catch { return []; }
}

// ── Verify credentials ──
export async function verifyAdminCredentials(username: string, password: string): Promise<AdminUser | null> {
  // Fallback: check env vars for super_admin
  const envUser = process.env.ADMIN_USERNAME || "admin";
  const envPass = process.env.ADMIN_PASSWORD || "admin123";

  if (username === envUser && password === envPass) {
    return { username, role: "super_admin", displayName: "مدير النظام", createdAt: new Date().toISOString() };
  }

  // Check sheet-based admins
  const admins = await loadAdminsFromSheets();
  for (const a of admins) {
    // For sheet admins, password is in column B (stored plain for demo — hash in production)
    if (a.username === username) {
      // Find the row with matching password
      try {
        const sheetId = getSheetId();
        const res = await googleApiRequest(`${SHEETS_BASE}/${sheetId}/values/Admins!A2:E`);
        const json = await res.json();
        const rows: string[][] = json.values || [];
        for (const row of rows) {
          if (row[0] === username && row[1] === password) {
            return a;
          }
        }
      } catch { }
    }
  }

  return null;
}

// ── Schedule password hash helper (for production) ──
export async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder();
  const hash = await crypto.subtle.digest("SHA-256", enc.encode(password));
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, "0")).join("");
}
