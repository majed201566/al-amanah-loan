"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { type User } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import {
  onAuthChange,
  registerWithEmail,
  loginWithEmail,
  logoutUser,
  resendVerificationEmail,
  sendPasswordReset,
} from "@/lib/firebase/auth";

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isVerified: boolean;
  register: (email: string, password: string, name: string) => Promise<User>;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  resendVerification: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  refresh: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      setUser(firebaseUser);
      setIsVerified(!!firebaseUser?.emailVerified);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleRegister = useCallback(
    async (email: string, password: string, name: string): Promise<User> => {
      const newUser = await registerWithEmail(email, password, name);
      setUser(newUser);
      setIsVerified(false);
      return newUser;
    },
    []
  );

  const handleLogin = useCallback(
    async (email: string, password: string): Promise<User> => {
      const loggedInUser = await loginWithEmail(email, password);
      setUser(loggedInUser);
      setIsVerified(true);
      return loggedInUser;
    },
    []
  );

  const handleLogout = useCallback(async (): Promise<void> => {
    await logoutUser();
    setUser(null);
    setIsVerified(false);
  }, []);

  const handleResendVerification = useCallback(async (): Promise<void> => {
    await resendVerificationEmail();
  }, []);

  const handleSendPasswordReset = useCallback(
    async (email: string): Promise<void> => {
      await sendPasswordReset(email);
    },
    []
  );

  const handleRefresh = useCallback(async (): Promise<void> => {
    const current = auth.currentUser;
    if (current) {
      await current.reload();
      setIsVerified(current.emailVerified);
      setUser({ ...current });
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isVerified,
        register: handleRegister,
        login: handleLogin,
        logout: handleLogout,
        resendVerification: handleResendVerification,
        sendPasswordReset: handleSendPasswordReset,
        refresh: handleRefresh,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
