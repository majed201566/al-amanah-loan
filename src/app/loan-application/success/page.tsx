"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { fetchApplication, type SheetApplication } from "@/lib/api-service";
import {
  CheckCircle2,
  LayoutDashboard,
  FileText,
  Copy,
  ExternalLink,
  Phone,
  Mail,
  AlertTriangle,
} from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id");
  const statusParam = searchParams.get("status") || "complete";
  const messageParam = searchParams.get("message") || "";

  const [application, setApplication] = useState<SheetApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [copied, setCopied] = useState(false);
  const confettiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) {
      router.replace("/loan-application");
      return;
    }

    // Try to fetch from API (Google Sheets) to confirm it was saved
    fetchApplication(id)
      .then((app) => {
        if (app) setApplication(app);
        setLoading(false);
      })
      .catch((err) => {
        setApiError("تعذر تأكيد الحفظ في Google Sheets، لكن تم استلام طلبك.");
        setLoading(false);
      });
  }, [id, router]);

  const handleCopy = () => {
    if (!id) return;
    navigator.clipboard.writeText(id).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const isPartial = statusParam === "partial";
  const decodedMessage = decodeURIComponent(messageParam || "");

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gradient-to-br from-navy-50 to-cream">
      {/* Confetti */}
      <div ref={confettiRef} className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: ["#C9A84C", "#E6C87F", "#A07A2E", "#0F2137", "#10b981", "#3b82f6"][i % 6],
              left: `${Math.random() * 100}%`,
              top: "-5%",
            }}
            initial={{ y: -20, opacity: 1, rotate: 0 }}
            animate={{ y: "100vh", opacity: 0, rotate: 360 * (i % 2 === 0 ? 1 : -1) }}
            transition={{ duration: 2 + Math.random() * 3, delay: Math.random() * 0.5, ease: "easeIn" }}
          />
        ))}
      </div>

      <Container className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto text-center"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
            className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center shadow-2xl ${
              isPartial
                ? "bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-500/30"
                : "bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/30"
            }`}
          >
            {isPartial ? (
              <AlertTriangle className="w-12 h-12 text-white" />
            ) : (
              <CheckCircle2 className="w-12 h-12 text-white" />
            )}
          </motion.div>

          {/* Title */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <h1 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-3">
              {isPartial ? "تم تقديم الطلب مع ملاحظات" : "تم تقديم طلبك "}
              {!isPartial && <span className="text-gradient-gold">بنجاح!</span>}
            </h1>
            <p className="text-navy-500 text-lg mb-3">
              {decodedMessage || "شكراً لتقديمك طلب التمويل. سنقوم بمراجعته والتواصل معك قريباً."}
            </p>
            {isPartial && (
              <p className="text-amber-600 text-sm mb-4">
                يرجى مراجعة المستندات التي تعذر رفعها والتواصل مع الدعم لاستكمالها.
              </p>
            )}
          </motion.div>

          {/* API Warning */}
          {apiError && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mb-4">
              <Card className="max-w-md mx-auto border-amber-200 bg-amber-50/70">
                <div className="flex items-center gap-2 text-sm text-amber-700">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{apiError}</span>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Application ID */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <Card className="max-w-md mx-auto mb-6 border-2 border-gold-200 bg-gradient-to-br from-gold-50/50 to-white">
              <div className="text-center">
                <p className="text-sm text-navy-500 mb-1">رقم الطلب</p>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <p className="text-2xl font-bold text-navy-900 font-mono tracking-wider">{id}</p>
                  <button onClick={handleCopy} className="p-2 rounded-lg hover:bg-gold-100 transition-all" title="نسخ">
                    <Copy className={`w-4 h-4 ${copied ? "text-emerald-500" : "text-navy-400"}`} />
                  </button>
                </div>
                {copied && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-emerald-600 font-medium">
                    ✓ تم النسخ
                  </motion.p>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Drive Folder Link */}
          {application?.folderUrl && application.folderUrl !== "تعذر إنشاء المجلد" && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
              <Card padding="lg" className="max-w-md mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-navy-900 mb-1">تم حفظ المستندات في Google Drive</p>
                <a
                  href={application.folderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-gold-600 hover:text-gold-700 font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  فتح مجلد المستندات
                </a>
              </Card>
            </motion.div>
          )}

          {/* Status Snapshot */}
          {application && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
              <Card padding="lg" className="max-w-md mx-auto mb-8">
                <h3 className="font-bold text-navy-900 mb-4">حالة الطلب من Google Sheets</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-navy-500">الحالة:</span>
                    <span className="font-bold text-navy-900">{application.status || "قيد الانتظار"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-navy-500">آخر تحديث:</span>
                    <span className="text-navy-700">{application.statusNote || "تم تقديم الطلب"}</span>
                  </div>
                  {application.rowNumber > 0 && (
                    <div className="flex justify-between">
                      <span className="text-navy-500">رقم الصف في Google Sheets:</span>
                      <span className="text-navy-700 font-mono">{application.rowNumber}</span>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Contact */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }} className="mb-8">
            <Card padding="lg" className="max-w-md mx-auto bg-navy-50/50">
              <p className="text-sm text-navy-600 mb-3">للاستفسار، يمكنك التواصل معنا:</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href="tel:+9647801234567" className="flex items-center gap-2 text-sm text-navy-700 hover:text-gold-600">
                  <Phone className="w-4 h-4 text-gold-500" />
                  <span dir="ltr">0770 123 4567</span>
                </a>
                <a href="mailto:info@al-amanah.iq" className="flex items-center gap-2 text-sm text-navy-700 hover:text-gold-600">
                  <Mail className="w-4 h-4 text-gold-500" />
                  <span dir="ltr">info@al-amanah.iq</span>
                </a>
              </div>
            </Card>
          </motion.div>

          {/* Actions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }} className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/applications">
              <Button variant="primary" size="lg">
                <FileText className="w-5 h-5" />
                متابعة حالة الطلب
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg">
                <LayoutDashboard className="w-5 h-5" />
                لوحة التحكم
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </Container>
    </div>
  );
}

export default function ApplicationSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
