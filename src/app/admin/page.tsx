"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Alert from "@/components/ui/Alert";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import type { SheetApplication } from "@/lib/api-service";
import {
  Landmark, LayoutDashboard, FileText, Search, ChevronLeft, LogOut, RefreshCw,
  ExternalLink, CheckCircle2, XCircle, Clock, Eye, Edit3, MessageSquare, TrendingUp,
  Wallet, BarChart3, MapPin, Phone, CreditCard, ArrowUpDown, Calendar, AlertCircle,
  X, Menu, Shield, Activity, Download, HardDrive, Settings, Users, PieChart, Target,
  Percent, Home, Car, Briefcase,
} from "lucide-react";

// ── Types ──
interface Stats {
  total: number; pending: number; review: number; approved: number; rejected: number;
  approvalRate: number; rejectionRate: number; dailyCount: number;
  monthlyTrend: { month: string; count: number; approved: number; rejected: number }[];
  byProvince: Record<string, { total: number; approved: number }>;
  byEmployment: Record<string, number>; byPurpose: Record<string, number>;
  totalRequested: number; totalApproved: number; avgLoan: number; avgProcessingDays: number;
}
interface AuditEntry { id: string; admin: string; role: string; action: string; target: string; details: string; timestamp: string; }

const statusConfig: Record<string, { variant: "gold"|"navy"|"success"|"outline"; bg: string; icon: React.ElementType; label: string }> = {
  "قيد الانتظار": { variant: "gold", bg: "bg-amber-100", icon: Clock, label: "قيد الانتظار" },
  "قيد المراجعة": { variant: "navy", bg: "bg-blue-100", icon: Eye, label: "قيد المراجعة" },
  "موافق عليه": { variant: "success", bg: "bg-emerald-100", icon: CheckCircle2, label: "موافق عليه" },
  "مرفوض": { variant: "outline", bg: "bg-red-100", icon: XCircle, label: "مرفوض" },
};

const roleLabels: Record<string, string> = { super_admin: "مدير عام", admin: "مدير", reviewer: "مراجع" };

export default function AdminDashboardPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<{ username: string; role: string; displayName: string }>({ username: "", role: "", displayName: "" });
  const [stats, setStats] = useState<Stats | null>(null);
  const [applications, setApplications] = useState<SheetApplication[]>([]);
  const [filteredApps, setFilteredApps] = useState<SheetApplication[]>([]);
  const [selectedApp, setSelectedApp] = useState<SheetApplication | null>(null);
  const [activities, setActivities] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview"|"applications"|"activities">("overview");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [provinceFilter, setProvinceFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"newest"|"oldest">("newest");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFields, setEditFields] = useState<Record<string, string>>({});
  const [noteText, setNoteText] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [detailTab, setDetailTab] = useState<"info"|"docs">("info");
  const [backingUp, setBackingUp] = useState(false);

  const isSuperAdmin = adminUser.role === "super_admin";

  // ── Auth ──
  useEffect(() => {
    fetch("/api/admin/me").then(r => r.json()).then(d => {
      if (d.authenticated) { setAuthed(true); setAdminUser({ username: d.username, role: d.role, displayName: d.displayName }); }
      else router.replace("/admin/login");
    }).catch(() => router.replace("/admin/login")).finally(() => setAuthLoading(false));
  }, [router]);

  // ── Load data ──
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, appsRes, actRes] = await Promise.all([
        fetch("/api/admin/stats"), fetch("/api/applications"), fetch("/api/admin/activities?limit=50"),
      ]);
      const [statsJson, appsJson, actJson] = await Promise.all([statsRes.json(), appsRes.json(), actRes.json()]);
      if (statsJson.success) setStats(statsJson.data);
      if (appsJson.success) {
        const sorted = [...appsJson.data].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setApplications(sorted); setFilteredApps(sorted);
      }
      if (actJson.success) setActivities(actJson.data || []);
    } catch { setError("تعذر تحميل البيانات"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (authed) loadData(); }, [authed, loadData]);

  // ── Filter ──
  useEffect(() => {
    let f = [...applications];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      f = f.filter(a => (a.fullName||"").toLowerCase().includes(q) || (a.phone||"").includes(q) || (a.nationalId||"").includes(q) || (a.id||"").toLowerCase().includes(q));
    }
    if (statusFilter !== "all") f = f.filter(a => a.status === statusFilter);
    if (provinceFilter !== "all") f = f.filter(a => a.province === provinceFilter);
    if (sortOrder === "oldest") f.reverse();
    setFilteredApps(f);
  }, [applications, searchQuery, statusFilter, provinceFilter, sortOrder]);

  // ── Actions ──
  const doAction = async (action: string, appId: string, extra?: Record<string, any>) => {
    setActionLoading(action); setError(""); setSuccessMsg("");
    try {
      const res = await fetch(`/api/admin/applications/${appId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, ...extra }) });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setSuccessMsg(json.message || "تم التنفيذ");
      if (json.data) setSelectedApp(json.data);
      await loadData();
    } catch (err: any) { setError(err.message); }
    finally { setActionLoading(null); }
  };

  const handleEdit = async () => { if (Object.keys(editFields).length === 0) return; await doAction("edit", selectedApp!.id, { edits: editFields }); setShowEditModal(false); setEditFields({}); };
  const handleNote = async () => { if (!noteText.trim()) return; await doAction("note", selectedApp!.id, { note: noteText }); setNoteText(""); setShowNoteInput(false); };
  const handleExport = (format: string) => { window.open(`/api/admin/export/${format}`, "_blank"); };
  const handleBackup = async () => {
    setBackingUp(true); setError("");
    try {
      const res = await fetch("/api/admin/backup", { method: "POST" });
      const json = await res.json();
      if (json.success) setSuccessMsg(json.message);
      else setError(json.message);
    } catch { setError("فشل النسخ الاحتياطي"); }
    finally { setBackingUp(false); }
  };
  const handleLogout = async () => { await fetch("/api/admin/logout", { method: "POST" }); router.replace("/admin/login"); };
  const provinces = stats?.byProvince ? Object.keys(stats.byProvince) : [];
  const maxTrend = stats?.monthlyTrend?.reduce((m, t) => Math.max(m, t.count), 1) || 1;
  const maxProvince = stats?.byProvince ? Math.max(...Object.values(stats.byProvince).map(p => p.total), 1) : 1;

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-navy-900"><LoadingSpinner size="lg" /></div>;
  if (!authed) return null;

  return (
    <div className="min-h-screen bg-navy-50 flex">
      {sidebarOpen && <div className="fixed inset-0 bg-navy-900/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* ── Sidebar ── */}
      <aside className={`fixed top-0 right-0 h-full w-72 bg-navy-900 z-50 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen?"translate-x-0":"translate-x-full"}`}>
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center"><Shield className="w-4 h-4 text-white" /></div>
              <div><span className="text-sm font-bold text-white block">الأمانة</span><span className="text-[10px] text-gold-400">لوحة الإدارة</span></div>
            </div>
            <button className="lg:hidden p-2 hover:bg-white/10 rounded-lg" onClick={() => setSidebarOpen(false)}><X className="w-5 h-5 text-white" /></button>
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {[
              { id: "overview", icon: LayoutDashboard, label: "نظرة عامة" },
              { id: "applications", icon: FileText, label: "إدارة الطلبات", badge: applications.length },
              { id: "activities", icon: Activity, label: "سجل النشاطات", badge: activities.length },
            ].map(l => (
              <button key={l.id} onClick={() => { setActiveTab(l.id as any); setSelectedApp(null); }}
                className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab===l.id?"bg-gold-500/20 text-gold-300 border border-gold-500/30":"text-navy-300 hover:bg-white/5 hover:text-white"}`}>
                <div className="flex items-center gap-3"><l.icon className="w-5 h-5" />{l.label}</div>
                {l.badge ? <span className="text-xs bg-white/10 text-white px-2 py-0.5 rounded-full">{l.badge}</span> : null}
              </button>
            ))}
            {isSuperAdmin && (
              <>
                <hr className="border-white/10 my-3" />
                <button onClick={() => router.push("/admin/settings")} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-navy-300 hover:bg-white/5 hover:text-white">
                  <Settings className="w-5 h-5" />الإعدادات
                </button>
                <button onClick={handleBackup} disabled={backingUp} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-navy-300 hover:bg-white/5 hover:text-white disabled:opacity-50">
                  <HardDrive className="w-5 h-5" />{backingUp ? "جاري النسخ..." : "نسخ احتياطي"}
                </button>
                <button onClick={() => handleExport("excel")} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-navy-300 hover:bg-white/5 hover:text-white">
                  <Download className="w-5 h-5" />تصدير Excel
                </button>
                <button onClick={() => handleExport("pdf")} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-navy-300 hover:bg-white/5 hover:text-white">
                  <Download className="w-5 h-5" />تصدير PDF
                </button>
              </>
            )}
          </nav>
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 px-3 py-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-white text-xs font-bold">{adminUser.displayName.charAt(0)}</div>
              <div><p className="text-sm text-white">{adminUser.displayName}</p><p className="text-[10px] text-navy-400">{roleLabels[adminUser.role] || adminUser.role}</p></div>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 w-full"><LogOut className="w-5 h-5" />تسجيل الخروج</button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-navy-100 px-3 sm:px-5 lg:px-8 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="lg:hidden p-2 rounded-lg hover:bg-navy-50" onClick={() => setSidebarOpen(true)}><Menu className="w-5 h-5" /></button>
              <div><h1 className="text-lg font-bold text-navy-900">لوحة التحكم</h1><p className="text-xs text-navy-500">مرحباً، {adminUser.displayName} • {roleLabels[adminUser.role] || adminUser.role}</p></div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={loadData} className="p-2 rounded-xl hover:bg-navy-50" title="تحديث"><RefreshCw className="w-5 h-5 text-navy-500" /></button>
              {isSuperAdmin && (
                <>
                  <Button size="sm" variant="outline" onClick={() => handleExport("excel")}><Download className="w-4 h-4" /><span className="hidden sm:inline">Excel</span></Button>
                  <Button size="sm" variant="outline" onClick={() => handleExport("pdf")}><Download className="w-4 h-4" /><span className="hidden sm:inline">PDF</span></Button>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 p-2 sm:p-5 lg:p-8 space-y-6 overflow-y-auto">
          <AnimatePresence>
            {error && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><Alert type="error" message={error} onClose={() => setError("")} /></motion.div>}
            {successMsg && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><Alert type="success" message={successMsg} onClose={() => setSuccessMsg("")} /></motion.div>}
          </AnimatePresence>

          {loading && !stats ? <div className="flex items-center justify-center py-20"><LoadingSpinner size="lg" /></div> : (
            <>
              {/* ─────── OVERVIEW ─────── */}
              {activeTab === "overview" && stats && (
                <div className="space-y-6">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: "إجمالي الطلبات", value: stats.total, icon: FileText, color: "from-blue-500 to-blue-700" },
                      { label: "طلبات اليوم", value: stats.dailyCount, icon: Calendar, color: "from-amber-500 to-amber-700" },
                      { label: "موافق عليه", value: stats.approved, icon: CheckCircle2, color: "from-emerald-500 to-emerald-700" },
                      { label: "مرفوض", value: stats.rejected, icon: XCircle, color: "from-red-500 to-red-700" },
                    ].map((s, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                        <Card padding="sm" className="flex items-center gap-4">
                          <div className={`w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center`}><s.icon className="w-5 h-5 text-white" /></div>
                          <div><p className="text-xs text-navy-400">{s.label}</p><p className="font-bold text-navy-900 text-lg">{s.value}</p></div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>

                  {/* Rates + Processing */}
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: "نسبة الموافقة", value: `${stats.approvalRate}%`, icon: Target, color: "from-emerald-500 to-emerald-600" },
                      { label: "نسبة الرفض", value: `${stats.rejectionRate}%`, icon: Percent, color: "from-red-400 to-red-500" },
                      { label: "متوسط مدة المعالجة", value: `${stats.avgProcessingDays} يوم`, icon: Clock, color: "from-blue-400 to-blue-600" },
                      { label: "متوسط مبلغ القرض", value: `${(stats.avgLoan/1000000).toFixed(1)}M`, icon: Wallet, color: "from-gold-400 to-gold-600" },
                    ].map((s, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.08 }}>
                        <Card padding="sm" className="text-center">
                          <div className={`w-10 h-10 mx-auto mb-2 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center`}><s.icon className="w-5 h-5 text-white" /></div>
                          <p className="font-bold text-navy-900 text-xl">{s.value}</p>
                          <p className="text-xs text-navy-400">{s.label}</p>
                        </Card>
                      </motion.div>
                    ))}
                  </div>

                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Monthly Trend */}
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                      <Card padding="lg">
                        <h3 className="font-bold text-navy-900 mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-gold-500" />الطلبات الشهرية (آخر 12 شهر)</h3>
                        <div className="h-48 flex items-end gap-1 px-1">
                          {stats.monthlyTrend.map((m, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                              <motion.div className="w-full flex flex-col gap-0.5" initial={{ height: 0 }} animate={{ height: `${Math.max((m.count/maxTrend)*100, 3)}%` }} transition={{ delay: 0.5 + i * 0.04, duration: 0.5 }}>
                                <div className="w-full bg-gradient-to-t from-emerald-400 to-emerald-300 rounded-t" style={{ height: `${(m.approved/Math.max(m.count,1))*100}%` }} />
                                <div className="w-full bg-gradient-to-t from-gold-400 to-gold-300" style={{ height: `${Math.max(((m.count-m.approved-m.rejected)/Math.max(m.count,1))*100, 2)}%` }} />
                              </motion.div>
                              <span className="text-[9px] text-navy-400 -rotate-45 origin-right">{m.month}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-center gap-4 mt-4 text-xs">
                          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-400" />موافق</span>
                          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gold-400" />قيد الانتظار</span>
                        </div>
                      </Card>
                    </motion.div>

                    {/* Province */}
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                      <Card padding="lg">
                        <h3 className="font-bold text-navy-900 mb-4 flex items-center gap-2"><MapPin className="w-5 h-5 text-gold-500" />التوزيع حسب المحافظة</h3>
                        <div className="space-y-2.5 max-h-48 overflow-y-auto">
                          {Object.entries(stats.byProvince).sort(([,a],[,b]) => b.total - a.total).map(([p, d], i) => (
                            <div key={p}>
                              <div className="flex justify-between text-xs mb-0.5"><span className="text-navy-600">{p}</span><span className="text-navy-900 font-bold">{d.total} ({d.approved} ✓)</span></div>
                              <div className="w-full h-2 bg-navy-100 rounded-full overflow-hidden">
                                <motion.div className="h-full bg-gradient-to-r from-gold-400 to-gold-500 rounded-full" initial={{ width: 0 }} animate={{ width: `${(d.total/maxProvince)*100}%` }} transition={{ delay: 0.5 + i * 0.03, duration: 0.5 }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </motion.div>
                  </div>

                  {/* Employment & Purpose */}
                  <div className="grid lg:grid-cols-2 gap-6">
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                      <Card padding="lg"><h3 className="font-bold text-navy-900 mb-3 flex items-center gap-2"><Briefcase className="w-5 h-5 text-gold-500" />نوع الوظيفة</h3>
                        <div className="space-y-2">{(Object.entries(stats.byEmployment||{})).sort(([,a],[,b])=>b-a).slice(0,5).map(([k,v],i)=>(
                          <div key={k} className="flex justify-between text-sm"><span className="text-navy-600">{k}</span><span className="font-bold text-navy-900">{v}</span></div>
                        ))}</div>
                      </Card>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
                      <Card padding="lg"><h3 className="font-bold text-navy-900 mb-3 flex items-center gap-2"><Target className="w-5 h-5 text-gold-500" />الغرض من القرض</h3>
                        <div className="space-y-2">{(Object.entries(stats.byPurpose||{})).sort(([,a],[,b])=>b-a).slice(0,5).map(([k,v],i)=>(
                          <div key={k} className="flex justify-between text-sm"><span className="text-navy-600">{k}</span><span className="font-bold text-navy-900">{v}</span></div>
                        ))}</div>
                      </Card>
                    </motion.div>
                  </div>

                  {/* Totals */}
                  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                    <Card padding="lg" className="bg-gradient-to-r from-navy-800 to-navy-950 border-none text-white">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3"><Wallet className="w-10 h-10 text-gold-400" /><div><p className="text-navy-300 text-sm">إجمالي المبالغ المطلوبة</p><p className="text-2xl font-bold text-white">{stats.totalRequested.toLocaleString("en")} د.ع</p></div></div>
                        <div className="flex items-center gap-3"><CheckCircle2 className="w-10 h-10 text-emerald-400" /><div><p className="text-navy-300 text-sm">إجمالي المبالغ الموافق عليها</p><p className="text-2xl font-bold text-white">{stats.totalApproved.toLocaleString("en")} د.ع</p></div></div>
                      </div>
                    </Card>
                  </motion.div>
                </div>
              )}

              {/* ─────── APPLICATIONS TAB ─────── */}
              {activeTab === "applications" && (
                <div>
                  <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <div className="relative flex-1">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                      <input type="text" placeholder="بحث بالاسم، الهاتف، البطاقة الوطنية..." value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)} className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-navy-200 text-sm focus:outline-none focus:border-gold-400" />
                    </div>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2.5 rounded-xl border border-navy-200 text-sm bg-white">
                      <option value="all">كل الحالات</option>
                      {Object.keys(statusConfig).map(s => <option key={s} value={s}>{statusConfig[s].label}</option>)}
                    </select>
                    <select value={provinceFilter} onChange={e => setProvinceFilter(e.target.value)} className="px-4 py-2.5 rounded-xl border border-navy-200 text-sm bg-white">
                      <option value="all">كل المحافظات</option>
                      {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <button onClick={() => setSortOrder(s => s==="newest"?"oldest":"newest")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-navy-200 text-sm bg-white hover:bg-navy-50">
                      <ArrowUpDown className="w-4 h-4" />{sortOrder==="newest"?"الأحدث":"الأقدم"}
                    </button>
                  </div>

                  <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto">
                      {filteredApps.length===0 ? <Card padding="lg" className="text-center"><FileText className="w-10 h-10 text-navy-300 mx-auto mb-2" /><p className="text-navy-500 text-sm">لا توجد طلبات</p></Card> : filteredApps.map(app => {
                        const info = statusConfig[app.status]||statusConfig["قيد الانتظار"];
                        return (
                          <motion.div key={app.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                            <Card hover padding="sm" className={`cursor-pointer ${selectedApp?.id===app.id?"border-gold-400 bg-gold-50/30 shadow-lg":""}`}
                              onClick={() => { setSelectedApp(app); setShowNoteInput(false); setDetailTab("info"); }}>
                              <div className="flex items-center justify-between">
                                <div className="min-w-0"><p className="text-sm font-bold text-navy-900 truncate">{app.fullName}</p><p className="text-xs text-navy-400 font-mono">{app.id}</p></div>
                                <Badge variant={info.variant} size="sm">{info.label}</Badge>
                              </div>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>

                    <div className="lg:col-span-2">
                      <AnimatePresence mode="wait">
                        {selectedApp ? (
                          <motion.div key={selectedApp.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            <Card padding="lg">
                              <div className="flex items-center justify-between mb-4">
                                <div><p className="font-bold text-navy-900 text-lg">{selectedApp.fullName}</p><p className="text-xs text-navy-400 font-mono">{selectedApp.id} • {selectedApp.phone} • {selectedApp.province}</p></div>
                                <Badge variant={statusConfig[selectedApp.status]?.variant||"gold"}>{selectedApp.status}</Badge>
                              </div>
                              <div className="flex gap-1 mb-4 border-b border-navy-100 pb-2">
                                {[{id:"info",label:"البيانات"},{id:"docs",label:"المستندات"}].map(t=>(
                                  <button key={t.id} onClick={()=>setDetailTab(t.id as any)} className={`px-4 py-2 rounded-lg text-sm font-medium ${detailTab===t.id?"bg-gold-50 text-gold-700":"text-navy-500 hover:bg-navy-50"}`}>{t.label}</button>
                                ))}
                              </div>
                              {detailTab==="info"?(
                                <div>
                                  <div className="bg-navy-50 rounded-xl p-4 grid sm:grid-cols-2 gap-2 text-sm mb-4 max-h-[340px] overflow-y-auto">
                                    {[["الاسم",selectedApp.fullName],["اسم الأم",selectedApp.motherName],["البطاقة",selectedApp.nationalId],["الهاتف",selectedApp.phone],["المحافظة",selectedApp.province],["المدينة",selectedApp.city],["العنوان",selectedApp.address],["الميلاد",selectedApp.dateOfBirth],["الحالة",selectedApp.maritalStatus],["الأطفال",selectedApp.numChildren],["طوارئ",selectedApp.emergencyContact],["الوظيفة",selectedApp.employmentType],["جهة العمل",selectedApp.employer],["الراتب",`${Number(selectedApp.monthlySalary||0).toLocaleString("en")} د.ع`],["الغرض",selectedApp.loanPurpose],["المبلغ",`${Number(selectedApp.loanAmount||0).toLocaleString("en")} د.ع`],["ملاحظات",selectedApp.notes||"—"]].map(([l,v],i)=>(
                                      <div key={i} className="flex justify-between"><span className="text-navy-500 text-xs">{l}:</span><span className="text-navy-900 font-medium text-xs truncate max-w-[140px]">{v||"—"}</span></div>
                                    ))}
                                  </div>
                                  {showNoteInput && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-4">
                                      <textarea value={noteText} onChange={e=>setNoteText(e.target.value)} placeholder="أضف ملاحظة..." rows={2} className="w-full rounded-xl border border-navy-200 p-3 text-sm focus:outline-none focus:border-gold-400 resize-none" />
                                      <div className="flex gap-2 mt-2"><Button size="sm" onClick={handleNote} loading={actionLoading==="note"}>حفظ</Button><Button size="sm" variant="ghost" onClick={()=>{setShowNoteInput(false);setNoteText("")}}>إلغاء</Button></div>
                                    </motion.div>
                                  )}
                                  <div className="flex flex-wrap gap-2 pt-3 border-t border-navy-100">
                                    {selectedApp.status!=="موافق عليه"&&<Button size="sm" variant="primary" onClick={()=>doAction("approve",selectedApp.id,{note:"تمت الموافقة"})} loading={actionLoading==="approve"}><CheckCircle2 className="w-4 h-4" />موافقة</Button>}
                                    {selectedApp.status!=="مرفوض"&&<Button size="sm" variant="danger" onClick={()=>doAction("reject",selectedApp.id,{note:"تم رفض الطلب"})} loading={actionLoading==="reject"}><XCircle className="w-4 h-4" />رفض</Button>}
                                    {selectedApp.status!=="قيد المراجعة"&&selectedApp.status!=="موافق عليه"&&selectedApp.status!=="مرفوض"&&<Button size="sm" variant="secondary" onClick={()=>doAction("review",selectedApp.id,{note:"تحويل للمراجعة"})} loading={actionLoading==="review"}><Eye className="w-4 h-4" />مراجعة</Button>}
                                    <Button size="sm" variant="outline" onClick={()=>{setShowNoteInput(!showNoteInput);setNoteText(selectedApp.statusNote||"")}}><MessageSquare className="w-4 h-4" />ملاحظة</Button>
                                    <Button size="sm" variant="outline" onClick={()=>{setEditFields({fullName:selectedApp.fullName,motherName:selectedApp.motherName,nationalId:selectedApp.nationalId,phone:selectedApp.phone,province:selectedApp.province,city:selectedApp.city,address:selectedApp.address,employer:selectedApp.employer,monthlySalary:selectedApp.monthlySalary,loanAmount:selectedApp.loanAmount});setShowEditModal(true)}}><Edit3 className="w-4 h-4" />تعديل</Button>
                                    {selectedApp.folderUrl&&selectedApp.folderUrl!=="تعذر إنشاء المجلد"&&<a href={selectedApp.folderUrl} target="_blank" rel="noopener"><Button size="sm" variant="ghost"><ExternalLink className="w-4 h-4" />Drive</Button></a>}
                                  </div>
                                </div>
                              ):(
                                <div className="text-center py-8">
                                  {selectedApp.folderUrl&&selectedApp.folderUrl!=="تعذر إنشاء المجلد"?(
                                    <><CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-3" /><p className="font-bold text-navy-900 mb-2">المستندات في Google Drive</p>
                                      <a href={selectedApp.folderUrl} target="_blank" rel="noopener" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 text-white font-medium hover:shadow-lg transition-all"><ExternalLink className="w-5 h-5" />فتح المجلد</a>
                                      <p className="text-sm text-navy-400 mt-4">{selectedApp.fullName} - {selectedApp.phone}</p></>
                                  ):<><AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-3" /><p className="text-navy-500">المستندات غير متوفرة</p></>}
                                </div>
                              )}
                            </Card>
                          </motion.div>
                        ):(
                          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><Card padding="lg" className="text-center flex flex-col items-center justify-center min-h-[400px]"><Eye className="w-16 h-16 text-navy-200 mx-auto mb-4" /><h3 className="text-lg font-bold text-navy-900 mb-2">اختر طلباً</h3><p className="text-navy-500 text-sm">اختر أحد الطلبات لعرض التفاصيل وإجراءات الإدارة</p></Card></motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              )}

              {/* ─────── ACTIVITIES TAB ─────── */}
              {activeTab === "activities" && (
                <div>
                  <Card padding="lg">
                    <h3 className="font-bold text-navy-900 text-lg mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-gold-500" />سجل النشاطات الكامل</h3>
                    {activities.length===0?<div className="text-center py-12"><Activity className="w-12 h-12 text-navy-200 mx-auto mb-3" /><p className="text-navy-500">لا توجد نشاطات</p></div>:(
                      <div className="space-y-2 max-h-[500px] overflow-y-auto">
                        {activities.map(act=>(
                          <div key={act.id} className="flex items-start gap-3 p-3 rounded-xl bg-navy-50 hover:bg-navy-100 transition-colors">
                            <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center text-sm ${act.action==="approve"?"bg-emerald-100 text-emerald-600":act.action==="reject"?"bg-red-100 text-red-600":act.action==="edit"?"bg-blue-100 text-blue-600":act.action==="backup"?"bg-purple-100 text-purple-600":act.action==="export_excel"||act.action==="export_pdf"?"bg-green-100 text-green-600":"bg-navy-100 text-navy-600"}`}>
                              {act.action==="approve"?"✓":act.action==="reject"?"✗":act.action==="edit"?"✎":act.action==="backup"?"💾":"•"}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-navy-900">{act.details}</p>
                              <p className="text-xs text-navy-400">
                                {act.action} • {act.admin} ({roleLabels[act.role]||act.role}) • <span dir="ltr">{new Date(act.timestamp).toLocaleDateString("ar-IQ",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}</span>
                              </p>
                            </div>
                            <span className="text-[10px] text-navy-400 font-mono">{act.target}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Edit Modal ── */}
      <AnimatePresence>
        {showEditModal&&selectedApp&&(
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center bg-navy-900/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4"><h3 className="font-bold text-navy-900 text-lg">تعديل بيانات المتقدم</h3><button onClick={()=>setShowEditModal(false)} className="p-2 hover:bg-navy-50 rounded-lg"><X className="w-5 h-5" /></button></div>
                <div className="space-y-3">
                  {[{key:"fullName",label:"الاسم"},{key:"motherName",label:"اسم الأم"},{key:"nationalId",label:"البطاقة"},{key:"phone",label:"الهاتف"},{key:"province",label:"المحافظة"},{key:"city",label:"المدينة"},{key:"address",label:"العنوان"},{key:"employer",label:"جهة العمل"},{key:"monthlySalary",label:"الراتب"},{key:"loanAmount",label:"المبلغ"}].map(f=>(
                    <div key={f.key}><label className="block text-xs font-medium text-navy-600 mb-1">{f.label}</label>
                      <input type="text" value={editFields[f.key]||""} onChange={e=>setEditFields(p=>({...p,[f.key]:e.target.value}))} className="w-full rounded-xl border border-navy-200 px-3 py-2 text-sm focus:outline-none focus:border-gold-400" /></div>
                  ))}
                </div>
                <div className="flex gap-3 mt-6"><Button size="sm" onClick={handleEdit} loading={actionLoading==="edit"} className="flex-1">حفظ</Button><Button size="sm" variant="outline" onClick={()=>{setShowEditModal(false);setEditFields({})}} className="flex-1">إلغاء</Button></div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
