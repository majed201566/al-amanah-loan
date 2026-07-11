"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  ArrowLeft, Save, RefreshCw, Shield, Landmark, Phone, Mail, MapPin, Globe,
  Building, Image, FileText, Settings as SettingsIcon, MessageCircle,
  Clock, CreditCard, Home, Car, Briefcase, AlarmCheck,
} from "lucide-react";

// ── Setting sections ──
const sections = [
  { id: "general", label: "عام", icon: SettingsIcon },
  { id: "hero", label: "القسم الرئيسي", icon: Home },
  { id: "contact", label: "معلومات الاتصال", icon: Phone },
  { id: "social", label: "وسائل التواصل", icon: Globe },
  { id: "loans", label: "منتجات التمويل", icon: CreditCard },
  { id: "content", label: "المحتوى النصي", icon: FileText },
];

export default function AdminSettingsPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [role, setRole] = useState("");
  const [activeSection, setActiveSection] = useState("general");
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [edited, setEdited] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // ── Auth ──
  useEffect(() => {
    fetch("/api/admin/me").then(r => r.json()).then(d => {
      if (d.authenticated) { setAuthed(true); setRole(d.role); }
      else router.replace("/admin/login");
    }).catch(() => router.replace("/admin/login")).finally(() => setAuthLoading(false));
  }, [router]);

  // ── Load ──
  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/settings");
      const json = await res.json();
      if (json.success) setSettings(json.data);
    } catch { setError("تعذر جلب الإعدادات"); }
    finally { setLoading(false); }
  };
  useEffect(() => { if (authed) loadSettings(); }, [authed]);

  const update = (key: string, value: string) => setEdited(p => ({ ...p, [key]: value }));
  const currentValue = (key: string) => edited[key] !== undefined ? edited[key] : (settings[key] || "");

  const handleSave = async () => {
    if (Object.keys(edited).length === 0) return;
    setSaving(true); setError(""); setSuccess("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates: edited }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setSettings(json.data);
      setEdited({});
      setSuccess("تم حفظ الإعدادات بنجاح");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "فشل الحفظ");
    } finally { setSaving(false); }
  };

  const field = (key: string, label: string, placeholder?: string, type = "text") => (
    <div>
      <label className="block text-sm font-medium text-navy-700 mb-1.5">{label}</label>
      {type === "textarea" ? (
        <textarea value={currentValue(key)} onChange={e => update(key, e.target.value)} placeholder={placeholder}
          rows={3} className="w-full rounded-xl border border-navy-200 p-3 text-sm focus:outline-none focus:border-gold-400 resize-none" />
      ) : (
        <input type={type} value={currentValue(key)} onChange={e => update(key, e.target.value)} placeholder={placeholder}
          className="w-full rounded-xl border border-navy-200 px-4 py-2.5 text-sm focus:outline-none focus:border-gold-400" />
      )}
      {edited[key] !== undefined && <span className="text-xs text-amber-500 mt-1">تم التعديل</span>}
    </div>
  );

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-navy-900"><LoadingSpinner size="lg" /></div>;
  if (!authed) return null;
  const isSuperAdmin = role === "super_admin";

  return (
    <div className="min-h-screen bg-navy-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-navy-900 min-h-screen p-4 hidden lg:block">
        <div className="flex items-center gap-2 mb-8 p-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center"><Shield className="w-4 h-4 text-white" /></div>
          <div><span className="text-sm font-bold text-white block">الأمانة</span><span className="text-[10px] text-gold-400">الإعدادات</span></div>
        </div>
        <nav className="space-y-1">
          {sections.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeSection === s.id ? "bg-gold-500/20 text-gold-300 border border-gold-500/30" : "text-navy-300 hover:bg-white/5 hover:text-white"}`}>
              <s.icon className="w-5 h-5" />{s.label}
            </button>
          ))}
        </nav>
        <div className="mt-8">
          <button onClick={() => router.push("/admin")} className="flex items-center gap-2 text-navy-400 hover:text-white text-sm px-3 py-2">
            <ArrowLeft className="w-4 h-4" />العودة للوحة التحكم
          </button>
        </div>
      </aside>

      {/* Mobile nav */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white/80 backdrop-blur-xl border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => router.push("/admin")} className="p-2"><ArrowLeft className="w-5 h-5" /></button>
            <span className="font-bold text-navy-900">الإعدادات</span>
          </div>
          <select value={activeSection} onChange={e => setActiveSection(e.target.value)} className="px-3 py-1.5 rounded-lg border text-sm bg-white">
            {sections.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 lg:pt-8 pt-20">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-navy-900">إعدادات الموقع</h1>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={loadSettings}><RefreshCw className="w-4 h-4" /></Button>
              <Button size="sm" onClick={handleSave} loading={saving} disabled={Object.keys(edited).length === 0 && !isSuperAdmin}>
                <Save className="w-4 h-4" />حفظ التغييرات
              </Button>
            </div>
          </div>

          <AnimatePresence>
            {success && <div className="mb-4"><Alert type="success" message={success} onClose={() => setSuccess("")} /></div>}
            {error && <div className="mb-4"><Alert type="error" message={error} onClose={() => setError("")} /></div>}
          </AnimatePresence>

          {loading ? <LoadingSpinner size="lg" className="py-20" /> : (
            <AnimatePresence mode="wait">
              {/* ── GENERAL ── */}
              {activeSection === "general" && (
                <motion.div key="general" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                  <Card padding="lg"><h3 className="font-bold text-navy-900 mb-4 flex items-center gap-2"><Landmark className="w-5 h-5 text-gold-500" />معلومات الموقع</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {field("site_name", "اسم الموقع")}
                      {field("logo_text", "نص الشعار")}
                      {field("logo_subtext", "نص الشعار الفرعي")}
                      {field("site_description", "وصف الموقع", "وصف قصير للموقع", "textarea")}
                    </div>
                  </Card>
                  <Card padding="lg"><h3 className="font-bold text-navy-900 mb-4 flex items-center gap-2"><Building className="w-5 h-5 text-gold-500" />الألوان</h3>
                    <div className="grid sm:grid-cols-3 gap-4">
                      {field("color_primary", "اللون الأساسي (ذهبي)", "#C9A84C", "color")}
                      {field("color_secondary", "اللون الثانوي (كحلي)", "#0A1628", "color")}
                      {field("color_accent", "اللون المساعد (كريمي)", "#F8F5EE", "color")}
                    </div>
                  </Card>
                </motion.div>
              )}
              {/* ── HERO ── */}
              {activeSection === "hero" && (
                <motion.div key="hero" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <Card padding="lg"><h3 className="font-bold text-navy-900 mb-4 flex items-center gap-2"><Home className="w-5 h-5 text-gold-500" />القسم الرئيسي للصفحة</h3>
                    <div className="space-y-4">
                      {field("hero_title", "العنوان الرئيسي")}
                      {field("hero_subtitle", "النص الفرعي", "", "textarea")}
                      {field("hero_badge", "نص الشارة")}
                    </div>
                  </Card>
                </motion.div>
              )}
              {/* ── CONTACT ── */}
              {activeSection === "contact" && (
                <motion.div key="contact" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <Card padding="lg"><h3 className="font-bold text-navy-900 mb-4 flex items-center gap-2"><Phone className="w-5 h-5 text-gold-500" />معلومات الاتصال</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {field("contact_phone", "رقم الهاتف", "+964 780 123 4567")}
                      {field("contact_email", "البريد الإلكتروني", "info@al-amanah.iq")}
                      {field("contact_address", "العنوان", "", "textarea")}
                      {field("working_hours", "ساعات العمل")}
                    </div>
                  </Card>
                </motion.div>
              )}
              {/* ── SOCIAL ── */}
              {activeSection === "social" && (
                <motion.div key="social" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <Card padding="lg"><h3 className="font-bold text-navy-900 mb-4 flex items-center gap-2"><Globe className="w-5 h-5 text-gold-500" />وسائل التواصل الاجتماعي</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {field("facebook_url", "فيسبوك", "https://facebook.com/")}
                      {field("twitter_url", "تويتر", "https://twitter.com/")}
                      {field("instagram_url", "انستغرام", "https://instagram.com/")}
                      {field("linkedin_url", "لينكد إن", "https://linkedin.com/")}
                    </div>
                  </Card>
                </motion.div>
              )}
              {/* ── LOANS ── */}
              {activeSection === "loans" && (
                <motion.div key="loans" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                  {[
                    { prefix: "personal", icon: CreditCard, title: "القرض الشخصي" },
                    { prefix: "housing", icon: Home, title: "القرض العقاري" },
                    { prefix: "business", icon: Briefcase, title: "قرض المشاريع" },
                    { prefix: "car", icon: Car, title: "قرض السيارة" },
                  ].map(l => (
                    <Card key={l.prefix} padding="lg">
                      <h3 className="font-bold text-navy-900 mb-4 flex items-center gap-2"><l.icon className="w-5 h-5 text-gold-500" />{l.title}</h3>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {field(`loan_${l.prefix}_title`, "العنوان")}
                        {field(`loan_${l.prefix}_desc`, "الوصف", "", "textarea")}
                      </div>
                    </Card>
                  ))}
                </motion.div>
              )}
              {/* ── CONTENT ── */}
              {activeSection === "content" && (
                <motion.div key="content" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                  <Card padding="lg"><h3 className="font-bold text-navy-900 mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-gold-500" />المحتوى النصي</h3>
                    <div className="space-y-4">
                      {field("about_story_title", "عنوان قصة النجاح")}
                      {field("about_story_text", "نص قصة النجاح", "", "textarea")}
                      {field("cta_title", "عنوان دعوة الإجراء")}
                      {field("cta_subtitle", "نص دعوة الإجراء", "", "textarea")}
                      {field("footer_text", "نص الفوتر")}
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </motion.div>
      </div>
    </div>
  );
}
