"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AuthGuard from "@/components/ui/AuthGuard";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import {
  LayoutDashboard,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Wallet,
  Bell,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  Landmark,
  CreditCard,
  AlertCircle,
} from "lucide-react";

const sidebarLinks = [
  { icon: LayoutDashboard, label: "لوحة التحكم", href: "/dashboard", active: true },
  { icon: FileText, label: "طلباتي", href: "/applications", badge: "2" },
  { icon: Wallet, label: "التمويلات النشطة", href: "#" },
  { icon: Clock, label: "سجل المدفوعات", href: "#" },
  { icon: Bell, label: "الإشعارات", href: "#", badge: "3" },
  { icon: User, label: "الملف الشخصي", href: "/profile" },
  { icon: Settings, label: "الإعدادات", href: "#" },
];

const activeLoans = [
  {
    id: "LN-2025-001",
    type: "قرض شخصي",
    amount: "25,000,000",
    remaining: "18,750,000",
    monthlyPayment: "625,000",
    nextPayment: "2026-08-01",
    status: "active",
    progress: 25,
  },
];

const recentApplications = [
  {
    id: "APP-2025-089",
    type: "قرض عقاري",
    amount: "150,000,000",
    date: "2026-07-05",
    status: "review",
  },
  {
    id: "APP-2025-076",
    type: "قرض شخصي",
    amount: "25,000,000",
    date: "2026-06-15",
    status: "approved",
  },
];

const statusMap: Record<string, { label: string; variant: "gold" | "navy" | "success" | "outline"; icon: React.ElementType }> = {
  active: { label: "نشط", variant: "success", icon: CheckCircle },
  review: { label: "قيد المراجعة", variant: "gold", icon: Clock },
  approved: { label: "موافق عليه", variant: "success", icon: CheckCircle },
  rejected: { label: "مرفوض", variant: "navy", icon: XCircle },
};

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const displayName = user?.displayName || "المستخدم";
  const userInitial = (user?.displayName || user?.email || "م").charAt(0).toUpperCase();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch {
      // silent
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-navy-50 flex">
        {/* Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-navy-900/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed top-0 right-0 h-full w-72 bg-white border-l border-navy-100 z-50 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${
            sidebarOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full">
            <div className="p-5 border-b border-navy-100 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                  <Landmark className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="text-sm font-bold text-navy-900 block leading-tight">الأمانة</span>
                  <span className="text-[10px] text-gold-600">للتمويل</span>
                </div>
              </Link>
              <button className="lg:hidden p-2 hover:bg-navy-50 rounded-lg" onClick={() => setSidebarOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {sidebarLinks.map((link, i) => (
                <Link
                  key={i}
                  href={link.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    link.active
                      ? "bg-gold-50 text-gold-700 border border-gold-200"
                      : "text-navy-600 hover:bg-navy-50 hover:text-navy-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <link.icon className="w-5 h-5" />
                    {link.label}
                  </div>
                  {link.badge && (
                    <span className="w-5 h-5 rounded-full bg-gold-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>

            <div className="p-4 border-t border-navy-100">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 w-full transition-all"
              >
                <LogOut className="w-5 h-5" />
                تسجيل الخروج
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Top Bar */}
          <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-navy-100 px-4 sm:px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  className="lg:hidden p-2 rounded-lg hover:bg-navy-50"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-lg font-bold text-navy-900">
                    أهلاً بك، {displayName}
                  </h1>
                  <p className="text-xs text-navy-500">
                    {user?.email || "لوحة التحكم الشخصية"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="relative p-2 rounded-xl hover:bg-navy-50">
                  <Bell className="w-5 h-5 text-navy-600" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                </button>
                <Link href="/profile">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
                    {userInitial}
                  </div>
                </Link>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
            {/* Stats */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: Wallet, label: "التمويلات النشطة", value: "1", color: "from-gold-400 to-gold-600" },
                { icon: FileText, label: "الطلبات قيد المراجعة", value: "1", color: "from-navy-500 to-navy-700" },
                { icon: CreditCard, label: "إجمالي المدفوع", value: "6,250,000 د.ع", color: "from-emerald-500 to-emerald-700" },
                { icon: TrendingUp, label: "الحد الائتماني", value: "50,000,000 د.ع", color: "from-blue-500 to-blue-700" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Card padding="sm" className="flex items-center gap-4">
                    <div className={`w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-navy-400">{stat.label}</p>
                      <p className="font-bold text-navy-900 text-sm">{stat.value}</p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Active Loan */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <Card padding="lg">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-navy-900 text-lg">التمويلات النشطة</h3>
                      <Badge variant="success">نشط</Badge>
                    </div>
                    {activeLoans.map((loan) => (
                      <div key={loan.id}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                          <div>
                            <p className="text-sm text-navy-500">
                              رقم التمويل:{" "}
                              <span className="font-mono font-medium text-navy-700">{loan.id}</span>
                            </p>
                            <p className="font-bold text-navy-900 text-lg mt-1">{loan.type}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-navy-400">القسط الشهري</p>
                            <p className="font-bold text-gold-600 text-lg" dir="ltr">
                              {loan.monthlyPayment} د.ع
                            </p>
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-3 gap-4 mb-6">
                          <div className="text-center p-3 rounded-xl bg-navy-50">
                            <p className="text-xs text-navy-400">المبلغ الإجمالي</p>
                            <p className="font-bold text-navy-900 text-sm" dir="ltr">
                              {loan.amount} د.ع
                            </p>
                          </div>
                          <div className="text-center p-3 rounded-xl bg-navy-50">
                            <p className="text-xs text-navy-400">المبلغ المتبقي</p>
                            <p className="font-bold text-navy-900 text-sm" dir="ltr">
                              {loan.remaining} د.ع
                            </p>
                          </div>
                          <div className="text-center p-3 rounded-xl bg-navy-50">
                            <p className="text-xs text-navy-400">الدفعة القادمة</p>
                            <p className="font-bold text-navy-900 text-sm" dir="ltr">
                              {loan.nextPayment}
                            </p>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-navy-500">نسبة السداد</span>
                            <span className="font-bold text-navy-900">{loan.progress}%</span>
                          </div>
                          <div className="w-full h-3 bg-navy-100 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-gold-400 to-gold-600 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${loan.progress}%` }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </Card>
                </motion.div>

                {/* Recent Applications */}
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                  <Card padding="lg">
                    <h3 className="font-bold text-navy-900 text-lg mb-4">الطلبات الأخيرة</h3>
                    <div className="divide-y divide-navy-50">
                      {recentApplications.map((app) => {
                        const status = statusMap[app.status];
                        const StatusIcon = status.icon;
                        return (
                          <div
                            key={app.id}
                            className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                          >
                            <div>
                              <p className="text-sm font-medium text-navy-900">{app.type}</p>
                              <p className="text-xs text-navy-400">
                                {app.id} • <span dir="ltr">{app.amount} د.ع</span> • {app.date}
                              </p>
                            </div>
                            <Badge variant={status.variant}>
                              <StatusIcon className="w-3 h-3" />
                              {status.label}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                </motion.div>
              </div>

              {/* Sidebar Widgets */}
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <Card padding="lg" className="text-center">
                    <Calendar className="w-10 h-10 text-gold-500 mx-auto mb-3" />
                    <p className="font-bold text-navy-900 mb-1">الدفعة القادمة</p>
                    <p className="text-3xl font-bold text-gold-600 mb-1" dir="ltr">
                      625,000 د.ع
                    </p>
                    <p className="text-xs text-navy-400 mb-4">تاريخ الاستحقاق: 2026-08-01</p>
                    <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 text-white font-medium text-sm hover:shadow-lg hover:shadow-gold-500/25 transition-all">
                      سدد الآن
                    </button>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                >
                  <Card padding="lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-gold-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-navy-900 text-sm mb-1">تذكير</p>
                        <p className="text-navy-500 text-xs leading-relaxed">
                          يرجى تحديث المستندات الشخصية قبل انتهاء صلاحيتها لضمان استمرارية الخدمة.
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Link href="/loan-application">
                    <Card
                      padding="lg"
                      className="bg-gradient-to-br from-navy-800 to-navy-950 border-none text-white text-center hover:shadow-2xl transition-all cursor-pointer"
                    >
                      <ArrowUpRight className="w-8 h-8 text-gold-400 mx-auto mb-3" />
                      <p className="font-bold mb-1">هل تحتاج تمويلاً جديداً؟</p>
                      <p className="text-navy-300 text-xs">
                        قدم طلبك الآن واحصل على الموافقة خلال 24 ساعة
                      </p>
                    </Card>
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
