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
  const { isAuthenticated, isVerified, register } = useAuth();

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

  // ── Success state after registration ──
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
                  <li>ابحث عن رسالة من Firebase بعنوان &quot;Verify your email&quot;</li>
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
      <div className="fixed top-0 right-0 w-96 h-96 bg-gold-100/50 rounded-full blur-3xl -z-10" />
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
