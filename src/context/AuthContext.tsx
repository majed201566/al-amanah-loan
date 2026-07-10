"use client";

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { type User } from "firebase/auth";
import { getAuthInstance } from "@/lib/firebase/config";
import { onAuthChange, registerWithEmail, loginWithEmail, logoutUser, resendVerificationEmail, sendPasswordReset } from "@/lib/firebase/auth";

interface AuthState {
  user: User | null; loading: boolean; isAuthenticated: boolean; isVerified: boolean; firebaseReady: boolean;
  register: (e: string, p: string, n: string) => Promise<User>;
  login: (e: string, p: string) => Promise<User>;
  logout: () => Promise<void>;
  resendVerification: () => Promise<void>;
  sendPasswordReset: (e: string) => Promise<void>;
  refresh: () => Promise<void>;
  setUser: (u: User | null) => void;
}

const C = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [firebaseReady, setFirebaseReady] = useState(false);

  useEffect(() => {
    const a = getAuthInstance();
    if (!a) { setLoading(false); setFirebaseReady(false); return; }
    setFirebaseReady(true);
    return onAuthChange((u) => { setUser(u); setIsVerified(!!u?.emailVerified); setLoading(false); });
  }, []);

  const hReg = useCallback(async (e: string, p: string, n: string) => { const u = await registerWithEmail(e, p, n); setUser(u); setIsVerified(false); return u; }, []);
  const hLog = useCallback(async (e: string, p: string) => { const u = await loginWithEmail(e, p); setUser(u); setIsVerified(true); return u; }, []);
  const hOut = useCallback(async () => { await logoutUser(); setUser(null); setIsVerified(false); }, []);
  const hVer = useCallback(async () => { await resendVerificationEmail(); }, []);
  const hRes = useCallback(async (e: string) => { await sendPasswordReset(e); }, []);
  const hRef = useCallback(async () => { const a = getAuthInstance(); if (!a?.currentUser) return; await a.currentUser.reload(); setIsVerified(a.currentUser.emailVerified); setUser(Object.assign({}, a.currentUser)); }, []);

  return (
    <C.Provider value={{
      user, loading, isAuthenticated: !!user, isVerified, firebaseReady,
      register: hReg, login: hLog, logout: hOut,
      resendVerification: hVer, sendPasswordReset: hRes,
      refresh: hRef, setUser
    }}>
      {children}
    </C.Provider>
  );
}

export function useAuth(): AuthState { const c = useContext(C); if (!c) throw new Error("useAuth must be used within AuthProvider"); return c; }
export default C;
