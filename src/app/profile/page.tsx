"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AuthGuard from "@/components/ui/AuthGuard";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Shield,
  ArrowLeft,
  Save,
  Check,
  LogOut,
  Trash2,
  AlertTriangle,
} from "lucide-react";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Editable fields
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      // In production: update Firestore profile
      // For now we simulate
      await new Promise((r) => setTimeout(r, 600));
      setSuccessMsg("تم حفظ التغييرات بنجاح");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "حدث خطأ أثناء حفظ البيانات");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch {
      setErrorMsg("حدث خطأ أثناء تسجيل الخروج");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await user?.delete();
      router.push("/");
    } catch (err: any) {
      setErrorMsg("يجب تسجيل الدخول مرة أخرى قبل حذف الحساب. سجل الدخول ثم حاول مجدداً.");
      setShowDelete(false);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-[calc(100vh-5rem)] bg-gradient-to-br from-navy-50 to-cream">
        <div className="w-full lg:max-w-4xl lg:mx-auto px-3 sm:px-5 lg:px-8 py-8 sm:py-12">
          {/* Back */}
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm text-navy-500 hover:text-navy-700 mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              العودة للوحة التحكم
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-100 to-gold-200 flex items-center justify-center text-2xl font-bold text-gold-700 shadow-lg">
                {displayName?.charAt(0) || "م"}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-navy-900">
                  {displayName || "المستخدم"}
                </h1>
                <p className="text-navy-500 text-sm">
                  {user?.email || ""}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Alerts */}
          {successMsg && (
            <div className="mb-6">
              <Alert type="success" message={successMsg} onClose={() => setSuccessMsg("")} />
            </div>
          )}
          {errorMsg && (
            <div className="mb-6">
              <Alert type="error" message={errorMsg} onClose={() => setErrorMsg("")} />
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Edit Profile Form */}
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card padding="lg">
                <h3 className="font-bold text-navy-900 text-lg mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-gold-500" />
                  تعديل الملف الشخصي
                </h3>

                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input
                      label="الاسم الكامل"
                      placeholder="أدخل اسمك"
                      icon={<User className="w-4 h-4" />}
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                    <Input
                      label="البريد الإلكتروني"
                      value={user?.email || ""}
                      icon={<Mail className="w-4 h-4" />}
                      disabled
                      className="bg-navy-50 cursor-not-allowed"
                    />
                  </div>
                  <Input
                    label="رقم الهاتف (للتطبيق فقط)"
                    type="tel"
                    placeholder="0770 123 4567"
                    icon={<Phone className="w-4 h-4" />}
                  />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input
                      label="المحافظة"
                      placeholder="النجف الأشرف"
                      icon={<MapPin className="w-4 h-4" />}
                      value={governorate}
                      onChange={(e) => setGovernorate(e.target.value)}
                    />
                    <Input
                      label="العنوان"
                      placeholder="الحي - الشارع"
                      icon={<MapPin className="w-4 h-4" />}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>

                  <div className="pt-3">
                    <Button type="submit" size="lg" loading={saving}>
                      <Save className="w-5 h-5" />
                      حفظ التغييرات
                    </Button>
                  </div>
                </form>
              </Card>
            </motion.div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Identity Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card padding="lg">
                  <h4 className="font-bold text-navy-900 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-gold-500" />
                    معلومات الحساب
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-navy-400">المعرف:</span>
                      <span className="text-navy-700 font-mono text-xs" dir="ltr">
                        {user?.uid?.slice(0, 12)}...
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-navy-400">الحالة:</span>
                      <Badge variant="success">نشط</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-navy-400">آخر تسجيل:</span>
                      <span className="text-navy-700" dir="ltr">
                        {user?.metadata?.lastSignInTime
                          ? new Date(user.metadata.lastSignInTime).toLocaleDateString(
                              "ar-IQ",
                              { year: "numeric", month: "long", day: "numeric" }
                            )
                          : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-navy-400">تاريخ التسجيل:</span>
                      <span className="text-navy-700" dir="ltr">
                        {user?.metadata?.creationTime
                          ? new Date(user.metadata.creationTime).toLocaleDateString(
                              "ar-IQ",
                              { year: "numeric", month: "long", day: "numeric" }
                            )
                          : "—"}
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-3"
              >
                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50 font-medium text-sm transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  تسجيل الخروج
                </button>

                {/* Delete Account */}
                {!showDelete ? (
                  <button
                    onClick={() => setShowDelete(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-navy-400 hover:text-red-500 hover:bg-red-50 font-medium text-sm transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    حذف الحساب
                  </button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="bg-red-50 border border-red-200 rounded-xl p-4"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-red-700 mb-1">
                          هل أنت متأكد؟
                        </p>
                        <p className="text-xs text-red-600">
                          هذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع بياناتك بشكل دائم.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleDeleteAccount}
                        className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-all"
                      >
                        نعم، احذف
                      </button>
                      <button
                        onClick={() => setShowDelete(false)}
                        className="flex-1 py-2 rounded-lg border border-navy-200 text-navy-600 text-sm font-medium hover:bg-white transition-all"
                      >
                        إلغاء
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
