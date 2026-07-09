"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import { validateEmail } from "@/lib/firebase/auth";
import { Landmark, Mail, ArrowLeft, Send, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(""); setGeneralError("");

    const err = validateEmail(email);
    if (err) { setEmailError(err); return; }

    setLoading(true);
    try {
      await sendPasswordReset(email);
      setSent(true);
    } catch (err: any) {
      const msg = err.message || "تعذر إرسال رابط إعادة التعيين";
      if (msg.includes("بريد") || msg.includes("email") || msg.includes("مستخدم")) {
        setEmailError(msg);
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

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/25"><Landmark className="w-6 h-6 text-white" /></div>
            <div className="text-right"><span className="text-xl font-bold text-navy-900 block leading-tight">الأمانة</span><span className="text-xs text-gold-600 font-medium">للتمويل</span></div>
          </Link>
        </div>

        <Card padding="lg" className="shadow-xl shadow-navy-900/5">
          {sent ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-navy-900 mb-2">تم إرسال رابط التعيين</h2>
              <p className="text-navy-500 text-sm mb-6">تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد.</p>
              <p className="text-xs text-navy-400 mb-6">لم تصلك الرسالة؟ تحقق من مجلد البريد المزعج (Spam).</p>
              <Link href="/login"><Button variant="primary" size="lg">العودة لتسجيل الدخول</Button></Link>
            </motion.div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-navy-900 mb-1 text-center">نسيت كلمة المرور</h1>
              <p className="text-navy-500 text-sm mb-6 text-center">أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور</p>

              {generalError && <div className="mb-4"><Alert type="error" message={generalError} onClose={() => setGeneralError("")} /></div>}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1.5">البريد الإلكتروني</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-navy-400"><Mail className="w-4 h-4" /></div>
                    <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setEmailError(""); }} placeholder="example@email.com" className={`w-full rounded-xl border bg-white pr-10 pl-4 py-3 text-sm text-navy-900 placeholder:text-navy-400 input-focus ${emailError ? "border-red-400" : "border-navy-200"}`} style={{ direction: "ltr" }} autoFocus />
                  </div>
                  {emailError && <p className="text-xs text-red-500 mt-1.5">{emailError}</p>}
                </div>
                <Button type="submit" size="lg" className="w-full" loading={loading}><Send className="w-5 h-5" />إرسال رابط التعيين</Button>
              </form>
            </>
          )}

          <div className="mt-6 pt-6 border-t border-navy-100 text-center">
            <Link href="/login" className="text-sm text-navy-500 hover:text-navy-700"><ArrowLeft className="w-4 h-4 inline-block" /> العودة لتسجيل الدخول</Link>
          </div>
        </Card>

        <div className="text-center mt-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-navy-500 hover:text-navy-700"><ArrowLeft className="w-4 h-4" />العودة للرئيسية</Link>
        </div>
      </motion.div>
    </div>
  );
}
