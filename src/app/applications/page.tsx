"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import AuthGuard from "@/components/ui/AuthGuard";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Alert from "@/components/ui/Alert";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import PageHeader from "@/components/sections/PageHeader";
import { fetchApplications, type SheetApplication } from "@/lib/api-service";
import {
  FileText,
  CheckCircle2,
  ArrowLeft,
  ArrowUpRight,
  Eye,
  RefreshCw,
  ExternalLink,
  Filter,
  AlertCircle,
} from "lucide-react";

// ── Status helpers ──
type AppStatus = "قيد الانتظار" | "قيد المراجعة" | "موافق عليه" | "مرفوض" | "pending" | "under_review" | "approved" | "rejected";

function normalizeStatus(status: string): AppStatus {
  const map: Record<string, AppStatus> = {
    "قيد الانتظار": "قيد الانتظار",
    "قيد المراجعة": "قيد المراجعة",
    "موافق عليه": "موافق عليه",
    "مرفوض": "مرفوض",
    "pending": "قيد الانتظار",
    "under_review": "قيد المراجعة",
    "approved": "موافق عليه",
    "rejected": "مرفوض",
  };
  return map[status] || "قيد الانتظار";
}

const statusConfig: Record<string, { variant: "gold" | "navy" | "success" | "outline"; bg: string; icon: string }> = {
  "قيد الانتظار": { variant: "gold", bg: "bg-amber-100", icon: "⏳" },
  "قيد المراجعة": { variant: "navy", bg: "bg-blue-100", icon: "🔍" },
  "موافق عليه": { variant: "success", bg: "bg-emerald-100", icon: "✅" },
  "مرفوض": { variant: "outline", bg: "bg-red-100", icon: "❌" },
};

export default function ApplicationsPage() {
  const { user, isAuthenticated } = useAuth();
  const [applications, setApplications] = useState<SheetApplication[]>([]);
  const [selectedApp, setSelectedApp] = useState<SheetApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const loadApplications = async () => {
    try {
      setRefreshing(true);
      setError("");
      const data = await fetchApplications();
      setApplications(data);
      // Keep selected in sync
      if (selectedApp) {
        const updated = data.find((a) => a.id === selectedApp.id);
        if (updated) setSelectedApp(updated);
        else if (data.length > 0) setSelectedApp(null);
      }
    } catch (err: any) {
      setError(err.message || "تعذر جلب قائمة الطلبات من Google Sheets");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const filteredApps =
    filter === "all"
      ? applications
      : applications.filter((a) => normalizeStatus(a.status) === filter);

  // ── Convert SheetApplication to display-friendly format ──
  const stat = selectedApp ? normalizeStatus(selectedApp.status) : "";
  const statusInfo = statusConfig[stat] || statusConfig["قيد الانتظار"];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <AuthGuard>
      <>
        <PageHeader
          title="متابعة الطلبات"
          description="تابع حالة طلبات التمويل الخاصة بك — البيانات من Google Sheets"
          breadcrumb={[{ label: "متابعة الطلبات" }]}
        />

        <Container>
          <div className="max-w-6xl mx-auto">
            {/* Error */}
            {error && (
              <div className="mb-6">
                <Alert type="warning" message={error} onClose={() => setError("")} />
              </div>
            )}

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { value: "all", label: "الكل" },
                  { value: "قيد الانتظار", label: "قيد الانتظار" },
                  { value: "قيد المراجعة", label: "قيد المراجعة" },
                  { value: "موافق عليه", label: "موافق عليه" },
                  { value: "مرفوض", label: "مرفوض" },
                ].map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setFilter(f.value)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      filter === f.value
                        ? "bg-gold-500 text-white shadow-lg shadow-gold-500/20"
                        : "bg-navy-50 text-navy-600 hover:bg-navy-100"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={loadApplications}
                  disabled={refreshing}
                  className="p-2.5 rounded-xl border border-navy-200 hover:bg-navy-50 transition-all disabled:opacity-50"
                  title="تحديث من Google Sheets"
                >
                  <RefreshCw className={`w-5 h-5 text-navy-500 ${refreshing ? "animate-spin" : ""}`} />
                </button>
                <Link href="/loan-application">
                  <Button size="sm">
                    طلب جديد
                    <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {applications.length === 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card padding="lg" className="text-center">
                  <FileText className="w-14 h-14 text-navy-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-navy-900 mb-2">لا توجد طلبات حتى الآن</h3>
                  <p className="text-navy-500 mb-6">
                    لم تقم بتقديم أي طلب تمويل بعد، أو لم تتم مزامنة البيانات مع Google Sheets بعد.
                  </p>
                  <Link href="/loan-application">
                    <Button size="lg">
                      قدم طلبك الأول
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                  </Link>
                </Card>
              </motion.div>
            )}

            {applications.length > 0 && (
              <div className="grid lg:grid-cols-3 gap-6">
                {/* List */}
                <div className="lg:col-span-1 space-y-3">
                  {filteredApps.length === 0 ? (
                    <Card padding="lg" className="text-center">
                      <Filter className="w-10 h-10 text-navy-300 mx-auto mb-2" />
                      <p className="text-navy-500 text-sm">لا توجد طلبات بهذه الحالة</p>
                    </Card>
                  ) : (
                    filteredApps.map((app) => {
                      const s = normalizeStatus(app.status);
                      const info = statusConfig[s] || statusConfig["قيد الانتظار"];
                      return (
                        <motion.div
                          key={app.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <Card
                            hover
                            padding="sm"
                            className={`cursor-pointer transition-all ${
                              selectedApp?.id === app.id
                                ? "border-gold-400 bg-gold-50/30 shadow-lg shadow-gold-500/5"
                                : ""
                            }`}
                            onClick={() => setSelectedApp(app)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-bold text-navy-900 font-mono">
                                  {app.id}
                                </p>
                                <p className="text-xs text-navy-500 mt-0.5">
                                  {app.fullName}
                                </p>
                              </div>
                              <div className="text-right">
                                <Badge variant={info.variant} size="sm">
                                  {s}
                                </Badge>
                                <p className="text-[10px] text-navy-400 mt-1" dir="ltr">
                                  {app.createdAt
                                    ? new Date(app.createdAt).toLocaleDateString("ar-IQ")
                                    : "—"}
                                </p>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })
                  )}
                </div>

                {/* Detail Panel */}
                <div className="lg:col-span-2">
                  <AnimatePresence mode="wait">
                    {selectedApp ? (
                      <motion.div
                        key={selectedApp.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                      >
                        <Card padding="lg">
                          {/* Header */}
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${statusInfo.bg}`}>
                                {statusInfo.icon}
                              </div>
                              <div>
                                <p className="font-bold text-navy-900 font-mono">{selectedApp.id}</p>
                                <p className="text-xs text-navy-400" dir="ltr">
                                  {selectedApp.createdAt
                                    ? new Date(selectedApp.createdAt).toLocaleDateString("ar-IQ", {
                                        year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
                                      })
                                    : "—"}
                                </p>
                              </div>
                            </div>
                            <Badge variant={statusInfo.variant}>{stat}</Badge>
                          </div>

                          {/* Status & Update info */}
                          <div className="mb-6 p-4 rounded-xl bg-navy-50">
                            <p className="text-xs text-navy-400 mb-1">آخر تحديث للحالة:</p>
                            <p className="text-sm font-medium text-navy-900">{selectedApp.statusNote || "—"}</p>
                            {selectedApp.updatedAt && (
                              <p className="text-xs text-navy-400 mt-1" dir="ltr">
                                {new Date(selectedApp.updatedAt).toLocaleDateString("ar-IQ", {
                                  month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
                                })}
                              </p>
                            )}
                          </div>

                          {/* Details */}
                          <div className="mb-6">
                            <h4 className="font-bold text-navy-900 text-sm mb-3">بيانات الطلب</h4>
                            <div className="bg-navy-50 rounded-2xl p-4 grid sm:grid-cols-2 gap-2.5 text-sm">
                              {[
                                ["الاسم", selectedApp.fullName],
                                ["اسم الأم", selectedApp.motherName],
                                ["البطاقة الوطنية", selectedApp.nationalId],
                                ["الهاتف", selectedApp.phone],
                                ["المحافظة", selectedApp.province],
                                ["المدينة", selectedApp.city],
                                ["العنوان", selectedApp.address],
                                ["تاريخ الميلاد", selectedApp.dateOfBirth],
                                ["الحالة الاجتماعية", selectedApp.maritalStatus],
                                ["عدد الأطفال", selectedApp.numChildren],
                                ["هاتف الطوارئ", selectedApp.emergencyContact],
                                ["نوع الوظيفة", selectedApp.employmentType],
                                ["جهة العمل", selectedApp.employer],
                                ["الراتب الشهري", `${Number(selectedApp.monthlySalary || "0").toLocaleString("en")} د.ع`],
                                ["الغرض من القرض", selectedApp.loanPurpose],
                                ["مبلغ القرض", `${Number(selectedApp.loanAmount || "0").toLocaleString("en")} د.ع`],
                                ["ملاحظات", selectedApp.notes || "—"],
                              ].map(([l, v], i) => (
                                <div key={i} className="flex justify-between">
                                  <span className="text-navy-500 text-xs">{l}:</span>
                                  <span className="text-navy-900 font-medium text-xs">{v || "—"}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Drive Folder Link */}
                          {selectedApp.folderUrl && selectedApp.folderUrl !== "تعذر إنشاء المجلد" && (
                            <div className="mb-6 p-4 rounded-xl bg-gold-50 border border-gold-200">
                              <div className="flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                <div>
                                  <p className="text-sm font-bold text-navy-900 mb-1">المستندات محفوظة في Google Drive</p>
                                  <a
                                    href={selectedApp.folderUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs text-gold-600 hover:text-gold-700 font-medium"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    فتح مجلد المستندات
                                  </a>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Info Notice */}
                          <div className="mt-4 p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-700">
                              يتم تحديث حالة الطلب من قبل فريق المراجعة مباشرة في Google Sheets.
                              اضغط على زر التحديث لمشاهدة آخر المستجدات.
                            </p>
                          </div>
                        </Card>
                      </motion.div>
                    ) : (
                      <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <Card padding="lg" className="text-center flex flex-col items-center justify-center min-h-[400px]">
                          <Eye className="w-16 h-16 text-navy-200 mx-auto mb-4" />
                          <h3 className="text-lg font-bold text-navy-900 mb-2">اختر طلباً للمتابعة</h3>
                          <p className="text-navy-500 text-sm max-w-sm">
                            اختر أحد طلباتك من القائمة لعرض التفاصيل الكاملة ومتابعة حالة الطلب.
                          </p>
                        </Card>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        </Container>
      </>
    </AuthGuard>
  );
}
