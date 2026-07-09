"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import { validateEmail, validatePassword } from "@/lib/firebase/auth";
import {
  Landmark, Mail, Lock, Eye, EyeOff, ArrowLeft, LogIn, ShieldCheck,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isVerified, login, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && isVerified) router.replace("/dashboard");
  }, [isAuthenticated, isVerified, router]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passError, setPassError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Check if redirected from verification link
  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    if (search.get("verified") === "true") {
      setSuccessMsg("تم تأكيد بريدك الإلكتروني بنجاح. يمكنك الآن تسجيل الدخول.");
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(""); setPassError(""); setGeneralError("");

    const emailErr = validateEmail(email);
    if (emailErr) { setEmailError(emailErr); return; }

    const passErr = validatePassword(password);
    if (passErr) { setPassError(passErr); return; }

    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      const msg = err.message || "فشل تسجيل الدخول";
      // Check if it's a verification-needed error
      if (msg.includes("تأكيد البريد") || msg.includes("verify")) {
        setGeneralError(msg);
      } else if (msg.includes("بريد") || msg.includes("email")) {
        setEmailError(msg);
      } else if (msg.includes("كلمة المرور") || msg.includes("password")) {
        setPassError(msg);
      } else {
        setGeneralError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-gradient-to-br from-navy-50 to-cream py-12 px-4">
      <div className="fixed top-0 right-0 w-96 h-96 bg-gold-100/50 rounded-full blur-3xl -z-10" />
      <div className="fixed bottom-0 left-0 w-72 h-72 bg-navy-100/30 rounded-full blur-3xl -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/25">
              <Landmark className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-navy-900 block leading-tight">الأمانة</span>
              <span className="text-xs text-gold-600 font-medium">للتمويل</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-navy-900">تسجيل الدخول</h1>
          <p className="text-navy-500 text-sm mt-2">أدخل بيانات حسابك للمتابعة</p>
        </div>

        <Card padding="lg" className="shadow-xl shadow-navy-900/5">
          <AnimatePresence>
            {generalError && (
              <div className="mb-4">
                <Alert type="error" message={generalError} onClose={() => setGeneralError("")} />
              </div>
            )}
            {successMsg && (
              <div className="mb-4">
                <Alert type="success" message={successMsg} onClose={() => setSuccessMsg("")} />
              </div>
            )}
          </AnimatePresence>

          <motion.form
            key="login-form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onSubmit={handleLogin}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 text-xs text-navy-500 bg-navy-50 rounded-xl p-3 mb-2">
              <ShieldCheck className="w-4 h-4 text-gold-500 shrink-0" />
              <span>معلوماتك محمية بأعلى معايير الأمان والتشفير.</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1.5">البريد الإلكتروني</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-navy-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(""); setGeneralError(""); }}
                  placeholder="example@email.com"
                  className={`w-full rounded-xl border bg-white pr-10 pl-4 py-3 text-sm text-navy-900 placeholder:text-navy-400 input-focus ${emailError ? "border-red-400" : "border-navy-200"}`}
                  style={{ direction: "ltr" }}
                  autoFocus
                />
              </div>
              {emailError && <p className="text-xs text-red-500 mt-1.5">{emailError}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1.5">كلمة المرور</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-navy-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setPassError(""); setGeneralError(""); }}
                  placeholder="••••••••"
                  className={`w-full rounded-xl border bg-white pr-10 pl-10 py-3 text-sm text-navy-900 placeholder:text-navy-400 input-focus ${passError ? "border-red-400" : "border-navy-200"}`}
                  style={{ direction: "ltr" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passError && <p className="text-xs text-red-500 mt-1.5">{passError}</p>}
            </div>

            <div className="text-left">
              <Link href="/forgot-password" className="text-sm text-gold-600 hover:text-gold-700 font-medium">
                نسيت كلمة المرور؟
              </Link>
            </div>

            <Button type="submit" size="lg" className="w-full" loading={loading} disabled={!email.trim() || !password || loading}>
              <LogIn className="w-5 h-5" />
              تسجيل الدخول
            </Button>
          </motion.form>

          <div className="mt-6 pt-6 border-t border-navy-100 text-center">
            <p className="text-sm text-navy-500">
              ليس لديك حساب؟{" "}
              <Link href="/register" className="text-gold-600 hover:text-gold-700 font-semibold">
                إنشاء حساب جديد
              </Link>
            </p>
          </div>
        </Card>

        <div className="text-center mt-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-navy-500 hover:text-navy-700">
            <ArrowLeft className="w-4 h-4" />العودة للرئيسية
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
