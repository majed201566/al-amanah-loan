"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import { Landmark, Shield, Lock, User, ArrowLeft } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("يرجى إدخال اسم المستخدم وكلمة المرور");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      router.replace("/admin");
    } catch (err: any) {
      setError(err.message || "فشل تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950 py-12 px-4">
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-gold-500/5 rounded-full blur-3xl" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-gold-500/3 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/25">
              <Landmark className="w-6 h-6 text-white" />
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-white block leading-tight">الأمانة</span>
              <span className="text-xs text-gold-400">للتمويل</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">لوحة تحكم المدير</h1>
          <p className="text-navy-300 text-sm">تسجيل الدخول للوحة الإدارة</p>
        </div>

        <Card padding="lg" className="bg-white/5 border-white/10">
          {error && (
            <div className="mb-4">
              <Alert type="error" message={error} onClose={() => setError("")} />
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy-200 mb-1.5">اسم المستخدم</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-navy-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full rounded-xl border border-white/10 bg-white/5 pr-10 pl-4 py-3 text-sm text-white placeholder:text-navy-500 focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-500/20 transition-all"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-200 mb-1.5">كلمة المرور</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-navy-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-white/5 pr-10 pl-4 py-3 text-sm text-white placeholder:text-navy-500 focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-500/20 transition-all"
                />
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full" loading={loading}>
              <Shield className="w-5 h-5" />
              دخول لوحة التحكم
            </Button>
          </form>
        </Card>

        <div className="text-center mt-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-navy-400 hover:text-gold-400 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            العودة للرئيسية
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
