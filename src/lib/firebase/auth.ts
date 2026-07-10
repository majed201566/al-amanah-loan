import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut,
  sendEmailVerification, sendPasswordResetEmail, applyActionCode,
  onAuthStateChanged, updateProfile, type User, type Auth,
} from "firebase/auth";
import { getAuthInstance } from "./config";

function requireAuth(): Auth {
  const a = getAuthInstance();
  if (!a) throw new Error("نظام المصادقة غير مهيأ. يرجى التواصل مع الدعم.");
  return a;
}

function mapFirebaseError(code: string): Error {
  const map: Record<string, string> = {
    "auth/email-already-in-use": "البريد الإلكتروني مسجل مسبقاً.",
    "auth/invalid-email": "صيغة البريد الإلكتروني غير صالحة.",
    "auth/user-not-found": "لا يوجد حساب بهذا البريد الإلكتروني.",
    "auth/wrong-password": "كلمة المرور غير صحيحة.",
    "auth/invalid-credential": "البريد أو كلمة المرور غير صحيحة.",
    "auth/weak-password": "كلمة المرور ضعيفة (6 أحرف على الأقل).",
    "auth/too-many-requests": "طلبات كثيرة. حاول لاحقاً.",
    "auth/network-request-failed": "فشل الاتصال. تحقق من الإنترنت.",
    "auth/requires-recent-login": "سجل الدخول مجدداً.",
    "auth/invalid-action-code": "رمز التحقق غير صالح.",
    "auth/expired-action-code": "انتهت صلاحية الرمز. اطلب رمزاً جديداً.",
    "auth/operation-not-allowed": "المصادقة غير مفعلة في Firebase.",
    "auth/user-disabled": "الحساب معطل. تواصل مع الدعم.",
  };
  return new Error(map[code] || `خطأ غير متوقع (${code})`);
}

export function validateEmail(email: string): string | null {
  if (!email?.trim()) return "يرجى إدخال البريد الإلكتروني";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "صيغة بريد غير صالحة";
  return null;
}

export function validatePassword(pw: string): string | null {
  if (!pw) return "يرجى إدخال كلمة المرور";
  if (pw.length < 6) return "كلمة المرور 6 أحرف على الأقل";
  return null;
}

export async function registerWithEmail(email: string, password: string, displayName: string): Promise<User> {
  try {
    const a = requireAuth();
    const uc = await createUserWithEmailAndPassword(a, email.trim(), password);
    if (displayName) await updateProfile(uc.user, { displayName });
    await sendEmailVerification(uc.user, { url: `${window.location.origin}/login?verified=true`, handleCodeInApp: true });
    return uc.user;
  } catch (e: any) { throw mapFirebaseError(e.code || "unknown"); }
}

export async function loginWithEmail(email: string, password: string): Promise<User> {
  try {
    const a = requireAuth();
    const uc = await signInWithEmailAndPassword(a, email.trim(), password);
    if (!uc.user.emailVerified) {
      try { await sendEmailVerification(uc.user, { url: `${window.location.origin}/login?verified=true`, handleCodeInApp: true }); } catch {}
      throw new Error("يرجى تأكيد البريد أولاً. تم إرسال رابط التأكيد.");
    }
    return uc.user;
  } catch (e: any) {
    if (e.message?.includes("يرجى تأكيد")) throw e;
    throw mapFirebaseError(e.code || "unknown");
  }
}

export async function resendVerificationEmail(): Promise<void> {
  const a = requireAuth();
  const u = a.currentUser;
  if (!u) throw new Error("لا يوجد مستخدم.");
  if (u.emailVerified) throw new Error("البريد مؤكد بالفعل.");
  try { await sendEmailVerification(u, { url: `${window.location.origin}/login?verified=true`, handleCodeInApp: true }); } catch (e: any) { throw mapFirebaseError(e.code || "unknown"); }
}

export async function sendPasswordReset(email: string): Promise<void> {
  try {
    const a = requireAuth();
    await sendPasswordResetEmail(a, email.trim(), { url: `${window.location.origin}/login`, handleCodeInApp: true });
  } catch (e: any) { throw mapFirebaseError(e.code || "unknown"); }
}

export async function applyVerificationCode(code: string): Promise<void> {
  try { await applyActionCode(requireAuth(), code); } catch (e: any) { throw mapFirebaseError(e.code || "unknown"); }
}

export async function logoutUser(): Promise<void> {
  try { const a = getAuthInstance(); if (a) await signOut(a); } catch {}
}

export function onAuthChange(cb: (u: User | null) => void) {
  const a = getAuthInstance();
  if (!a) { cb(null); return () => {}; }
  return onAuthStateChanged(a, cb);
}

export function getCurrentUser(): User | null { return getAuthInstance()?.currentUser || null; }

export async function refreshUser(): Promise<void> {
  const u = getAuthInstance()?.currentUser;
  if (u) await u.reload();
}
