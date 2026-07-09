import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  applyActionCode,
  onAuthStateChanged,
  updateProfile,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "./config";

// ── Error mapping (Arabic) ──
function mapFirebaseError(code: string): Error {
  const errorMap: Record<string, string> = {
    "auth/email-already-in-use":
      "البريد الإلكتروني مسجل مسبقاً. يرجى تسجيل الدخول أو استخدام بريد آخر.",
    "auth/invalid-email":
      "صيغة البريد الإلكتروني غير صالحة. يرجى التأكد من البريد.",
    "auth/user-disabled":
      "تم تعطيل هذا الحساب. يرجى التواصل مع الدعم.",
    "auth/user-not-found":
      "لا يوجد حساب بهذا البريد الإلكتروني.",
    "auth/wrong-password":
      "كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.",
    "auth/invalid-credential":
      "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
    "auth/weak-password":
      "كلمة المرور ضعيفة. يجب أن تتكون من 6 أحرف على الأقل.",
    "auth/too-many-requests":
      "طلبات كثيرة جداً. يرجى المحاولة لاحقاً.",
    "auth/network-request-failed":
      "فشل الاتصال بالشبكة. تحقق من اتصالك بالإنترنت.",
    "auth/requires-recent-login":
      "يرجى تسجيل الدخول مرة أخرى للمتابعة.",
    "auth/invalid-action-code":
      "رمز التحقق غير صالح أو منتهي الصلاحية.",
    "auth/expired-action-code":
      "انتهت صلاحية رمز التحقق. يرجى طلب رمز جديد.",
    "auth/operation-not-allowed":
      "المصادقة بالبريد الإلكتروني غير مفعلة في لوحة تحكم Firebase.",
  };

  return new Error(
    errorMap[code] ||
      `حدث خطأ غير متوقع. الرجاء المحاولة مرة أخرى. (${code})`
  );
}

// ── Email validation ──
export function validateEmail(email: string): string | null {
  if (!email || !email.trim()) return "يرجى إدخال البريد الإلكتروني";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    return "صيغة البريد الإلكتروني غير صالحة";
  return null;
}

// ── Password validation ──
export function validatePassword(password: string): string | null {
  if (!password) return "يرجى إدخال كلمة المرور";
  if (password.length < 6) return "كلمة المرور يجب أن تتكون من 6 أحرف على الأقل";
  return null;
}

// ── Register: create account + send verification email ──
export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<User> {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      getFirebaseAuth(),
      email.trim(),
      password
    );

    // Set display name
    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
    }

    // Send verification email
    await sendEmailVerification(userCredential.user, {
      url: `${window.location.origin}/login?verified=true`,
      handleCodeInApp: true,
    });

    return userCredential.user;
  } catch (error: any) {
    throw mapFirebaseError(error.code || "unknown");
  }
}

// ── Login: email + password ──
export async function loginWithEmail(
  email: string,
  password: string
): Promise<User> {
  try {
    const userCredential = await signInWithEmailAndPassword(
      getFirebaseAuth(),
      email.trim(),
      password
    );

    // Check if email is verified
    if (!userCredential.user.emailVerified) {
      // Send a new verification email in case they missed it
      try {
        await sendEmailVerification(userCredential.user, {
          url: `${window.location.origin}/login?verified=true`,
          handleCodeInApp: true,
        });
      } catch {
        // Silent — verification may already have been sent
      }
      throw new Error(
        "يرجى تأكيد البريد الإلكتروني أولاً. تم إرسال رابط التأكيد إلى بريدك."
      );
    }

    return userCredential.user;
  } catch (error: any) {
    // If it's already our custom error, rethrow
    if (error.message?.includes("يرجى تأكيد")) throw error;
    throw mapFirebaseError(error.code || "unknown");
  }
}

// ── Resend verification email ──
export async function resendVerificationEmail(): Promise<void> {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("لا يوجد مستخدم مسجل حالياً.");

  if (user.emailVerified) {
    throw new Error("البريد الإلكتروني مؤكد بالفعل.");
  }

  try {
    await sendEmailVerification(user, {
      url: `${window.location.origin}/login?verified=true`,
      handleCodeInApp: true,
    });
  } catch (error: any) {
    throw mapFirebaseError(error.code || "unknown");
  }
}

// ── Check if current user's email is verified ──
export function isEmailVerified(): boolean {
  const user = getFirebaseAuth().currentUser;
  return !!user?.emailVerified;
}

// ── Forgot password: send reset email ──
export async function sendPasswordReset(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(getFirebaseAuth(), email.trim(), {
      url: `${window.location.origin}/login`,
      handleCodeInApp: true,
    });
  } catch (error: any) {
    throw mapFirebaseError(error.code || "unknown");
  }
}

// ── Apply verification code from email link ──
export async function applyVerificationCode(code: string): Promise<void> {
  try {
    await applyActionCode(getFirebaseAuth(), code);
  } catch (error: any) {
    throw mapFirebaseError(error.code || "unknown");
  }
}

// ── Logout ──
export async function logoutUser(): Promise<void> {
  try {
    await signOut(getFirebaseAuth());
  } catch (error: any) {
    throw new Error("حدث خطأ أثناء تسجيل الخروج");
  }
}

// ── Auth state observer ──
export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(getFirebaseAuth(), callback);
}

// ── Get current user ──
export function getCurrentUser(): User | null {
  return getFirebaseAuth().currentUser;
}

// ── Refresh user (to get updated emailVerified status) ──
export async function refreshUser(): Promise<void> {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  if (user) await user.reload();
}
