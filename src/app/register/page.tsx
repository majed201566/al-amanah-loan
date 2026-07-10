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
  Landmark, Mail, Lock, User, Eye, EyeOff, ArrowLeft, ShieldCheck, CheckCircle2,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, isVerified, register, loginWithGoogle } = useAuth();

  useEffect(() => {
    if (isAuthenticated && isVerified) router.replace("/dashboard");
  }, [isAuthenticated, isVerified, router]);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};

    if (!fullName.trim() || fullName.trim().length < 3) errs.fullName = "الرجاء إدخال الاسم (3 أحرف على الأقل)";
    const emailErr = validateEmail(email);
    if (emailErr) errs.email = emailErr;
    const passErr = validatePassword(password);
    if (passErr) errs.password = passErr;
    if (password !== confirmPassword) errs.confirmPassword = "كلمتا المرور غير متطابقتين";
    if (!agreed) errs.agreed = "يجب الموافقة على الشروط والأحكام";

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true); setGeneralError("");
    try {
      await register(email, password, fullName);
      setRegisteredEmail(email);
      setRegistered(true);
    } catch (err: any) {
      const msg = err.message || "فشل إنشاء الحساب";
      if (msg.includes("بريد") || msg.includes("email") || msg.includes("مسجل")) {
        setErrors((p) => ({ ...p, email: msg }));
      } else {
        setGeneralError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true); setGeneralError("");
    try {
      await loginWithGoogle();
      router.push("/dashboard");
    } catch (err: any) {
      setGeneralError(err.message || "فشل إنشاء الحساب بحساب Google");
    } finally {
      setGoogleLoading(false);
    }
  };

  if (registered) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-gradient-to-br from-navy-50 to-cream py-12 px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-500/30">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-navy-900 mb-3">تم إنشاء الحساب بنجاح!</h1>
          <p className="text-navy-500 mb-2">تم إرسال رابط تأكيد إلى بريدك الإلكتروني:</p>
          <p className="text-navy-900 font-semibold mb-6" dir="ltr">{registeredEmail}</p>
          <Card padding="lg" className="text-left mb-6">
            <div className="flex items-start gap-3 text-sm text-navy-600">
              <ShieldCheck className="w-5 h-5 text-gold-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-navy-900 mb-2">الخطوة التالية:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>افتح بريدك الإلكتروني</li>
                  <li>ابحث عن رسالة من Firebase</li>
                  <li>اضغط على رابط التأكيد في الرسالة</li>
                  <li>عد إلى صفحة تسجيل الدخول وسجل دخولك</li>
                </ol>
                <p className="text-xs text-navy-400 mt-3">
                  لم تصلك الرسالة؟ تحقق من مجلد البريد المزعج (Spam).
                </p>
              </div>
            </div>
          </Card>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link href="/login"><Button variant="primary" size="lg">تسجيل الدخول</Button></Link>
            <Link href="/"><Button variant="outline" size="lg"><ArrowLeft className="w-4 h-4" />الرئيسية</Button></Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center bg-gradient-to-br from-navy-50 to-cream py-12 px-4">
      <div className="fixed top-0 right-0 w-full max-w-[384px] h-96 bg-gold-100/50 rounded-full blur-3xl -z-10" />
      <div className="fixed bottom-0 left-0 w-72 h-72 bg-navy-100/30 rounded-full blur-3xl -z-10" />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md">
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
          <h1 className="text-2xl font-bold text-navy-900">إنشاء حساب جديد</h1>
          <p className="text-navy-500 text-sm mt-2">سجل الآن للاستفادة من خدماتنا التمويلية</p>
        </div>

        <Card padding="lg" className="shadow-xl shadow-navy-900/5">
          <AnimatePresence>
            {generalError && (
              <div className="mb-4"><Alert type="error" message={generalError} onClose={() => setGeneralError("")} /></div>
            )}
          </AnimatePresence>

          {/* GOOGLE SIGN-UP — Quick option */}
          <div className="mb-6">
            <button
              onClick={handleGoogleSignUp}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-white border-2 border-navy-200 hover:border-gold-400 hover:shadow-lg hover:shadow-gold-500/10 transition-all duration-300 group disabled:opacity-50"
            >
              {googleLoading ? (
                <div className="w-5 h-5 border-2 border-navy-200 border-t-gold-500 rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              <span className="text-navy-800 font-medium text-sm">
                {googleLoading ? "جارٍ إنشاء الحساب..." : "إنشاء حساب بحساب Google"}
              </span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-navy-100" /></div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-navy-400">أو باستخدام البريد الإلكتروني</span>
            </div>
          </div>

          <motion.form initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1.5">الاسم الكامل</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-navy-400"><User className="w-4 h-4" /></div>
                <input type="text" value={fullName} onChange={(e) => { setFullName(e.target.value); setErrors((p) => ({ ...p, fullName: "" })); }} placeholder="الاسم الثلاثي" className={`w-full rounded-xl border bg-white pr-10 pl-4 py-3 text-sm text-navy-900 placeholder:text-navy-400 input-focus ${errors.fullName ? "border-red-400" : "border-navy-200"}`} autoFocus />
              </div>
              {errors.fullName && <p className="text-xs text-red-500 mt-1.5">{errors.fullName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1.5">البريد الإلكتروني</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-navy-400"><Mail className="w-4 h-4" /></div>
                <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }} placeholder="example@email.com" className={`w-full rounded-xl border bg-white pr-10 pl-4 py-3 text-sm text-navy-900 placeholder:text-navy-400 input-focus ${errors.email ? "border-red-400" : "border-navy-200"}`} style={{ direction: "ltr" }} />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1.5">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1.5">كلمة المرور</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-navy-400"><Lock className="w-4 h-4" /></div>
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: "" })); }} placeholder="6 أحرف على الأقل" className={`w-full rounded-xl border bg-white pr-10 pl-10 py-3 text-sm text-navy-900 placeholder:text-navy-400 input-focus ${errors.password ? "border-red-400" : "border-navy-200"}`} style={{ direction: "ltr" }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-600" tabIndex={-1}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password ? <p className="text-xs text-red-500 mt-1.5">{errors.password}</p> : <p className="text-xs text-navy-400 mt-1.5">الحد الأدنى: 6 أحرف</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1.5">تأكيد كلمة المرور</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-navy-400"><Lock className="w-4 h-4" /></div>
                <input type="password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirmPassword: "" })); }} placeholder="••••••••" className={`w-full rounded-xl border bg-white pr-10 pl-4 py-3 text-sm text-navy-900 placeholder:text-navy-400 input-focus ${errors.confirmPassword ? "border-red-400" : "border-navy-200"}`} style={{ direction: "ltr" }} />
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-500 mt-1.5">{errors.confirmPassword}</p>}
            </div>

            <div>
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" checked={agreed} onChange={(e) => { setAgreed(e.target.checked); setErrors((p) => ({ ...p, agreed: "" })); }} className="w-4 h-4 mt-0.5 rounded border-navy-300 text-gold-500 focus:ring-gold-500" />
                <span className="text-sm text-navy-600">أوافق على <Link href="/loan-conditions" className="text-gold-600 hover:text-gold-700">الشروط والأحكام</Link> وسياسة الخصوصية</span>
              </label>
              {errors.agreed && <p className="text-xs text-red-500 mt-1 mr-6">{errors.agreed}</p>}
            </div>

            <Button type="submit" size="lg" className="w-full" loading={loading}>إنشاء الحساب</Button>
          </motion.form>

          <div className="mt-6 pt-6 border-t border-navy-100 text-center">
            <p className="text-sm text-navy-500">لديك حساب بالفعل؟{" "}<Link href="/login" className="text-gold-600 hover:text-gold-700 font-semibold">تسجيل الدخول</Link></p>
          </div>
        </Card>

        <div className="text-center mt-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-navy-500 hover:text-navy-700"><ArrowLeft className="w-4 h-4" />العودة للرئيسية</Link>
        </div>
      </motion.div>
    </div>
  );
}
