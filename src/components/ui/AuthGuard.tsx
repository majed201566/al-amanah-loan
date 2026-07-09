"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AuthLoading from "./AuthLoading";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export default function AuthGuard({
  children,
  requireAuth = true,
  redirectTo = "/login",
}: AuthGuardProps) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return <AuthLoading />;
  }

  if (requireAuth && !isAuthenticated) {
    if (typeof window !== "undefined") {
      router.replace(redirectTo);
    }
    return <AuthLoading />;
  }

  return <>{children}</>;
}
