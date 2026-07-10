import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

function hasValidConfig(): boolean {
  return Boolean(
    firebaseConfig.apiKey && firebaseConfig.authDomain &&
    firebaseConfig.projectId && firebaseConfig.appId
  );
}

export function getFirebaseApp(): FirebaseApp | null {
  if (!hasValidConfig()) return null;
  if (getApps().length === 0) {
    try { initializeApp(firebaseConfig); } catch { return null; }
  }
  return getApps()[0] || null;
}

let authInstance: Auth | null = null;

export function getFirebaseAuth(): Auth | null {
  if (!hasValidConfig()) return null;
  if (!authInstance) {
    const app = getFirebaseApp();
    if (!app) return null;
    try { authInstance = getAuth(app); authInstance.languageCode = "ar"; } catch { return null; }
  }
  return authInstance;
}

let _auth: Auth | null | undefined;
export function getAuthInstance(): Auth | null {
  if (_auth === undefined) _auth = getFirebaseAuth();
  return _auth;
}
