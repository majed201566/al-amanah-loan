"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import PageHeader from "@/components/sections/PageHeader";
import Container from "@/components/ui/Container";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import FileUpload from "@/components/ui/FileUpload";
import Alert from "@/components/ui/Alert";
import {
  User,
  Phone,
  CreditCard,
  MapPin,
  Calendar,
  Briefcase,
  Banknote,
  FileText,
  Heart,
  Users,
  PhoneCall,
  StickyNote,
  ArrowLeft,
  ArrowRight,
  Check,
  Shield,
  Upload,
  Building,
  Target,
} from "lucide-react";
import {
  type ApplicationFormData,
  type FormErrors,
  validateApplicationForm,
} from "@/lib/validators";
import { submitApplication } from "@/lib/api-service";

// ── Step definitions ──
const steps = [
  { id: 1, label: "المعلومات الشخصية", icon: User },
  { id: 2, label: "تفاصيل العمل والدخل", icon: Briefcase },
  { id: 3, label: "تفاصيل القرض", icon: Banknote },
  { id: 4, label: "المستندات", icon: Upload },
  { id: 5, label: "مراجعة وتأكيد", icon: Shield },
];

// ── Dropdown Data ──
const provinces = [
  "النجف الأشرف", "بغداد", "البصرة", "كربلاء", "بابل",
  "واسط", "ذي قار", "ميسان", "القادسية", "المثنى",
  "الديوانية", "الأنبار", "صلاح الدين", "ديالى", "كركوك",
  "نينوى", "دهوك", "السليمانية", "أربيل",
];

const employmentTypes = [
  { value: "government", label: "موظف حكومي" },
  { value: "private", label: "موظف قطاع خاص" },
  { value: "self_employed", label: "عمل حر" },
  { value: "retired", label: "متقاعد" },
  { value: "business_owner", label: "صاحب عمل" },
];

const maritalStatuses = [
  { value: "single", label: "أعزب" },
  { value: "married", label: "متزوج" },
  { value: "divorced", label: "مطلق" },
  { value: "widowed", label: "أرمل" },
];

const loanPurposes = [
  { value: "personal", label: "احتياجات شخصية" },
  { value: "housing", label: "شراء منزل" },
  { value: "renovation", label: "ترميم عقار" },
  { value: "business", label: "تمويل مشروع" },
  { value: "education", label: "تعليم" },
  { value: "medical", label: "علاج طبي" },
  { value: "car", label: "شراء سيارة" },
  { value: "debt", label: "تسوية ديون" },
  { value: "wedding", label: "زواج" },
  { value: "other", label: "أخرى" },
];

const documentSlots = [
  { key: "idFront", label: "وجه البطاقة الوطنية الأمامي", required: true, icon: CreditCard },
  { key: "idBack", label: "وجه البطاقة الوطنية الخلفي", required: true, icon: CreditCard },
  { key: "residenceCard", label: "بطاقة السكن", required: true, icon: MapPin },
  { key: "salaryCard", label: "بطاقة الراتب أو كشف حساب", required: true, icon: Banknote },
  { key: "selfieWithId", label: "صورة شخصية مع البطاقة الوطنية", required: true, icon: User },
  { key: "other", label: "مستندات أخرى (اختياري)", required: false, icon: FileText },
];

export default function LoanApplicationPage() {
  const router = useRouter();
  const { user } = useAuth();

  // ── State ──
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState("");

  // Form data
  const [formData, setFormData] = useState<ApplicationFormData>({
    fullName: user?.displayName || "",
    motherName: "",
    nationalId: "",
    phone: "",
    province: "",
    city: "",
    address: "",
    dateOfBirth: "",
    employmentType: "",
    employer: "",
    monthlySalary: "",
    loanAmount: "",
    loanPurpose: "",
    maritalStatus: "",
    numChildren: "",
    emergencyContact: "",
    notes: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Documents
  const [documents, setDocuments] = useState<Record<string, File | null>>({
    idFront: null,
    idBack: null,
    residenceCard: null,
    salaryCard: null,
    selfieWithId: null,
    other: null,
  });

  const [docErrors, setDocErrors] = useState<Record<string, string>>({});

  // ── Update field ──
  const updateField = (key: keyof ApplicationFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setGeneralError("");
  };

  const updateDocument = (key: string, file: File | null) => {
    setDocuments((prev) => ({ ...prev, [key]: file }));
    setDocErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setGeneralError("");
  };

  // ── Step validation ──
  const validateStep = (s: number): boolean => {
    setGeneralError("");
    let stepErrors: FormErrors = {};

    if (s === 1) {
      const fields: (keyof ApplicationFormData)[] = [
        "fullName", "motherName", "nationalId", "phone",
        "province", "city", "address", "dateOfBirth",
        "maritalStatus",
      ];
      const fullValidation = validateApplicationForm(formData);
      for (const f of fields) {
        if (fullValidation[f]) stepErrors[f] = fullValidation[f]!;
      }
      // children only if married
      if (formData.maritalStatus === "married") {
        if (fullValidation.numChildren) stepErrors.numChildren = fullValidation.numChildren;
      }
    }

    if (s === 2) {
      const fields: (keyof ApplicationFormData)[] = [
        "employmentType", "employer", "monthlySalary",
      ];
      const fullValidation = validateApplicationForm(formData);
      for (const f of fields) {
        if (fullValidation[f]) stepErrors[f] = fullValidation[f]!;
      }
    }

    if (s === 3) {
      const fullValidation = validateApplicationForm(formData);
      if (fullValidation.loanAmount) stepErrors.loanAmount = fullValidation.loanAmount;
      if (fullValidation.loanPurpose) stepErrors.loanPurpose = fullValidation.loanPurpose;
    }

    if (s === 4) {
      const docErrs: Record<string, string> = {};
      for (const slot of documentSlots) {
        if (slot.required && !documents[slot.key]) {
          docErrs[slot.key] = `${slot.label} مطلوب`;
        }
      }
      setDocErrors(docErrs);
      if (Object.keys(docErrs).length > 0) return false;
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((p) => Math.min(p + 1, 5));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrev = () => {
    setStep((p) => Math.max(p - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Submit ──
  const handleSubmit = async () => {
    if (!validateStep(4)) {
      setStep(4);
      return;
    }
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      const allErrors = validateApplicationForm(formData);
      setErrors(allErrors);
      // Go to first step with errors
      const errKeys = Object.keys(allErrors);
      const firstErrKey = errKeys[0] as keyof ApplicationFormData;
      if (["fullName", "motherName", "nationalId", "phone", "province", "city", "address", "dateOfBirth", "maritalStatus", "numChildren"].includes(firstErrKey)) {
        setStep(1);
      } else if (["employmentType", "employer", "monthlySalary"].includes(firstErrKey)) {
        setStep(2);
      } else {
        setStep(3);
      }
      return;
    }

    setSubmitting(true);
    setGeneralError("");

    try {
      // Submit via the real API (Google Sheets + Drive)
      const result = await submitApplication(formData, documents);

      // Navigate to success page with application ID
      router.push(
        `/loan-application/success?id=${result.applicationId}&status=${result.status || "complete"}&message=${encodeURIComponent(result.message || "")}`
      );
    } catch (err: any) {
      setGeneralError(err.message || "حدث خطأ أثناء تقديم الطلب. يرجى المحاولة مرة أخرى.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render field with icon ──
  const renderField = (
    key: keyof ApplicationFormData,
    label: string,
    options?: { icon?: React.ReactNode; type?: string; placeholder?: string; dir?: string }
  ) => (
    <div>
      {options?.type === "select" ? null : (
        <Input
          label={label}
          type={options?.type || "text"}
          placeholder={options?.placeholder || label}
          icon={options?.icon}
          value={formData[key]}
          onChange={(e) => updateField(key, e.target.value)}
          error={errors[key]}
          required
          className={options?.dir === "ltr" ? "dir-ltr" : ""}
        />
      )}
    </div>
  );

  return (
    <>
      <PageHeader
        title="طلب تمويل"
        description="قدم طلبك الآن واحصل على الموافقة خلال 24 ساعة عمل"
        breadcrumb={[{ label: "طلب تمويل" }]}
      />

      <Container>
        <div className="max-w-4xl mx-auto">
          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-0 mb-10 overflow-x-auto pb-2">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <motion.div
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all shrink-0 ${
                    step === s.id
                      ? "bg-gold-500 text-white shadow-lg shadow-gold-500/20"
                      : step > s.id
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-navy-50 text-navy-400"
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      step === s.id
                        ? "bg-white/20"
                        : step > s.id
                        ? "bg-emerald-100"
                        : "bg-navy-100"
                    }`}
                  >
                    {step > s.id ? <Check className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                  </div>
                  <span className="hidden sm:inline">{s.label}</span>
                </motion.div>
                {i < steps.length - 1 && (
                  <div
                    className={`w-6 sm:w-8 h-0.5 mx-0.5 ${
                      step > s.id ? "bg-emerald-400" : "bg-navy-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* General Error */}
          <AnimatePresence>
            {generalError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-6"
              >
                <Alert type="error" message={generalError} onClose={() => setGeneralError("")} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form Steps */}
          <AnimatePresence mode="wait">
            {/* ─────── STEP 1: Personal Info ─────── */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card padding="lg">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-100 to-gold-200 flex items-center justify-center">
                      <User className="w-5 h-5 text-gold-600" />
                    </div>
                    <h3 className="text-xl font-bold text-navy-900">المعلومات الشخصية</h3>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input
                      label="الاسم الكامل"
                      placeholder="الاسم الرباعي الكامل"
                      icon={<User className="w-4 h-4" />}
                      value={formData.fullName}
                      onChange={(e) => updateField("fullName", e.target.value)}
                      error={errors.fullName}
                      required
                    />
                    <Input
                      label="اسم الأم"
                      placeholder="اسم الأم الثلاثي"
                      icon={<Heart className="w-4 h-4" />}
                      value={formData.motherName}
                      onChange={(e) => updateField("motherName", e.target.value)}
                      error={errors.motherName}
                      required
                    />
                    <Input
                      label="رقم البطاقة الوطنية"
                      placeholder="أدخل رقم البطاقة الوطنية"
                      icon={<CreditCard className="w-4 h-4" />}
                      value={formData.nationalId}
                      onChange={(e) => updateField("nationalId", e.target.value.replace(/\D/g, ""))}
                      error={errors.nationalId}
                      required
                    />
                    <div>
                      <label className="block text-sm font-medium text-navy-700 mb-1.5">
                        رقم الهاتف <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-navy-400">
                          <Phone className="w-4 h-4" />
                        </div>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => {
                            if (/[^\d\s\+]/.test(e.target.value)) return;
                            updateField("phone", e.target.value);
                          }}
                          placeholder="0770 123 4567"
                          maxLength={15}
                          className={`w-full rounded-xl border bg-white pr-10 pl-4 py-3 text-sm text-navy-900 placeholder:text-navy-400 input-focus ${
                            errors.phone ? "border-red-400" : "border-navy-200"
                          }`}
                          style={{ direction: "ltr" }}
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-xs text-red-500 mt-1.5">{errors.phone}</p>
                      )}
                    </div>
                    <Select
                      label="المحافظة"
                      options={provinces.map((p) => ({ value: p, label: p }))}
                      placeholder="اختر المحافظة"
                      value={formData.province}
                      onChange={(e) => updateField("province", e.target.value)}
                      error={errors.province}
                      required
                    />
                    <Input
                      label="المدينة"
                      placeholder="المدينة أو القضاء"
                      icon={<MapPin className="w-4 h-4" />}
                      value={formData.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      error={errors.city}
                      required
                    />
                    <div className="sm:col-span-2">
                      <Input
                        label="العنوان التفصيلي"
                        placeholder="الحي - الزقاق - رقم الدار"
                        icon={<MapPin className="w-4 h-4" />}
                        value={formData.address}
                        onChange={(e) => updateField("address", e.target.value)}
                        error={errors.address}
                        required
                      />
                    </div>
                    <Input
                      label="تاريخ الميلاد"
                      type="date"
                      icon={<Calendar className="w-4 h-4" />}
                      value={formData.dateOfBirth}
                      onChange={(e) => updateField("dateOfBirth", e.target.value)}
                      error={errors.dateOfBirth}
                      required
                    />
                    <Select
                      label="الحالة الاجتماعية"
                      options={maritalStatuses}
                      placeholder="اختر الحالة الاجتماعية"
                      value={formData.maritalStatus}
                      onChange={(e) => updateField("maritalStatus", e.target.value)}
                      error={errors.maritalStatus}
                      required
                    />
                    {formData.maritalStatus === "married" && (
                      <Input
                        label="عدد الأطفال"
                        type="number"
                        placeholder="0"
                        icon={<Users className="w-4 h-4" />}
                        value={formData.numChildren}
                        onChange={(e) => updateField("numChildren", e.target.value)}
                        error={errors.numChildren}
                      />
                    )}
                    <Input
                      label="رقم هاتف الطوارئ"
                      placeholder="0770 000 0000"
                      icon={<PhoneCall className="w-4 h-4" />}
                      value={formData.emergencyContact}
                      onChange={(e) => {
                        if (/[^\d\s\+]/.test(e.target.value)) return;
                        updateField("emergencyContact", e.target.value);
                      }}
                      error={errors.emergencyContact}
                      className="dir-ltr"
                    />
                  </div>

                  <div className="mt-8 flex justify-end">
                    <Button size="lg" onClick={handleNext}>
                      التالي - تفاصيل العمل
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* ─────── STEP 2: Employment & Income ─────── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card padding="lg">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy-100 to-navy-200 flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-navy-600" />
                    </div>
                    <h3 className="text-xl font-bold text-navy-900">تفاصيل العمل والدخل</h3>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Select
                      label="نوع الوظيفة"
                      options={employmentTypes}
                      placeholder="اختر نوع الوظيفة"
                      value={formData.employmentType}
                      onChange={(e) => updateField("employmentType", e.target.value)}
                      error={errors.employmentType}
                      required
                    />
                    <Input
                      label="جهة العمل"
                      placeholder="اسم الدائرة أو الشركة"
                      icon={<Building className="w-4 h-4" />}
                      value={formData.employer}
                      onChange={(e) => updateField("employer", e.target.value)}
                      error={errors.employer}
                      required
                    />
                    <div className="sm:col-span-2">
                      <Input
                        label="الراتب الشهري (دينار عراقي)"
                        type="number"
                        placeholder="مثال: 1,200,000"
                        icon={<Banknote className="w-4 h-4" />}
                        value={formData.monthlySalary}
                        onChange={(e) => updateField("monthlySalary", e.target.value)}
                        error={errors.monthlySalary}
                        required
                      />
                      <p className="text-xs text-navy-400 mt-1">الحد الأدنى للراتب: 500,000 دينار عراقي</p>
                    </div>
                  </div>

                  {/* Salary info card */}
                  {formData.monthlySalary && !errors.monthlySalary && Number(formData.monthlySalary) >= 500000 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-4 p-4 rounded-xl bg-gold-50 border border-gold-200"
                    >
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-gold-600" />
                        <div>
                          <p className="text-sm font-medium text-navy-900">
                            الحد الأقصى للتمويل: {Number(Number(formData.monthlySalary) * 60).toLocaleString("en")} د.ع
                          </p>
                          <p className="text-xs text-navy-500 mt-0.5">
                            يعادل 60 ضعف الراتب الشهري
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="mt-8 flex justify-between">
                    <Button variant="outline" size="lg" onClick={handlePrev}>
                      <ArrowRight className="w-5 h-5" />
                      السابق
                    </Button>
                    <Button size="lg" onClick={handleNext}>
                      التالي - تفاصيل القرض
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* ─────── STEP 3: Loan Details ─────── */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card padding="lg">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-100 to-gold-200 flex items-center justify-center">
                      <Banknote className="w-5 h-5 text-gold-600" />
                    </div>
                    <h3 className="text-xl font-bold text-navy-900">تفاصيل القرض</h3>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <Select
                        label="الغرض من القرض"
                        options={loanPurposes}
                        placeholder="اختر الغرض من القرض"
                        value={formData.loanPurpose}
                        onChange={(e) => updateField("loanPurpose", e.target.value)}
                        error={errors.loanPurpose}
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Input
                        label="مبلغ القرض المطلوب (دينار عراقي)"
                        type="number"
                        placeholder="مثال: 25,000,000"
                        icon={<Banknote className="w-4 h-4" />}
                        value={formData.loanAmount}
                        onChange={(e) => updateField("loanAmount", e.target.value)}
                        error={errors.loanAmount}
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Textarea
                        label="ملاحظات إضافية (اختياري)"
                        placeholder="أي معلومات إضافية تود ذكرها..."
                        rows={4}
                        value={formData.notes}
                        onChange={(e) => updateField("notes", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Loan summary */}
                  {formData.loanAmount && !errors.loanAmount && Number(formData.loanAmount) >= 1000000 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-4 p-4 rounded-xl bg-navy-50 border border-navy-100"
                    >
                      <h4 className="font-bold text-navy-900 mb-3">تقدير مبدئي</h4>
                      <div className="grid sm:grid-cols-3 gap-3 text-sm">
                        <div className="text-center p-3 rounded-lg bg-white">
                          <p className="text-navy-400 text-xs mb-1">مبلغ القرض</p>
                          <p className="font-bold text-navy-900">
                            {Number(formData.loanAmount).toLocaleString("en")} د.ع
                          </p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-white">
                          <p className="text-navy-400 text-xs mb-1">القسط التقريبي (60 شهر)</p>
                          <p className="font-bold text-gold-600">
                            {Math.round(Number(formData.loanAmount) / 60 * 1.08).toLocaleString("en")} د.ع
                          </p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-white">
                          <p className="text-navy-400 text-xs mb-1">نسبة الفائدة</p>
                          <p className="font-bold text-gold-600">من 8% سنوياً</p>
                        </div>
                      </div>
                      <p className="text-xs text-navy-400 mt-3 text-center">
                        * هذا تقدير مبدئي فقط. القسط الفعلي يحدد بعد الموافقة النهائية.
                      </p>
                    </motion.div>
                  )}

                  <div className="mt-8 flex justify-between">
                    <Button variant="outline" size="lg" onClick={handlePrev}>
                      <ArrowRight className="w-5 h-5" />
                      السابق
                    </Button>
                    <Button size="lg" onClick={handleNext}>
                      التالي - رفع المستندات
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* ─────── STEP 4: Documents ─────── */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card padding="lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center">
                      <Upload className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold text-navy-900">رفع المستندات</h3>
                  </div>
                  <p className="text-sm text-navy-500 mb-6 mr-13">
                    يرجى رفع صور واضحة للمستندات المطلوبة. الحد الأقصى لكل ملف: 10 ميغابايت. الصيغ المدعومة: JPG, PNG, WebP, PDF
                  </p>

                  <div className="grid sm:grid-cols-2 gap-6">
                    {documentSlots.map((slot) => (
                      <FileUpload
                        key={slot.key}
                        label={slot.label}
                        required={slot.required}
                        value={documents[slot.key]}
                        onChange={(file) => updateDocument(slot.key, file)}
                        error={docErrors[slot.key]}
                      />
                    ))}
                  </div>

                  <div className="mt-8 flex justify-between">
                    <Button variant="outline" size="lg" onClick={handlePrev}>
                      <ArrowRight className="w-5 h-5" />
                      السابق
                    </Button>
                    <Button size="lg" onClick={handleNext}>
                      التالي - مراجعة وتأكيد
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* ─────── STEP 5: Review & Submit ─────── */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card padding="lg">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-100 to-gold-200 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-gold-600" />
                    </div>
                    <h3 className="text-xl font-bold text-navy-900">مراجعة وتأكيد الطلب</h3>
                  </div>

                  {/* Personal Info */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-bold text-navy-900 text-sm mb-3 flex items-center gap-2">
                        <User className="w-4 h-4 text-gold-500" />
                        المعلومات الشخصية
                      </h4>
                      <div className="bg-navy-50 rounded-2xl p-4 grid sm:grid-cols-2 gap-3 text-sm">
                        {[
                          ["الاسم الكامل", formData.fullName],
                          ["اسم الأم", formData.motherName],
                          ["رقم البطاقة الوطنية", formData.nationalId],
                          ["رقم الهاتف", formData.phone],
                          ["المحافظة", formData.province],
                          ["المدينة", formData.city],
                          ["العنوان", formData.address],
                          ["تاريخ الميلاد", formData.dateOfBirth],
                          ["الحالة الاجتماعية", maritalStatuses.find((m) => m.value === formData.maritalStatus)?.label || ""],
                          ...(formData.maritalStatus === "married" ? [["عدد الأطفال", formData.numChildren]] as const : []),
                          ["هاتف الطوارئ", formData.emergencyContact || "—"],
                        ].map(([label, value], i) => (
                          <div key={i} className="flex justify-between">
                            <span className="text-navy-500">{label}:</span>
                            <span className="text-navy-900 font-medium">{value || "—"}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Employment */}
                    <div>
                      <h4 className="font-bold text-navy-900 text-sm mb-3 flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-gold-500" />
                        تفاصيل العمل والدخل
                      </h4>
                      <div className="bg-navy-50 rounded-2xl p-4 grid sm:grid-cols-2 gap-3 text-sm">
                        {[
                          ["نوع الوظيفة", employmentTypes.find((t) => t.value === formData.employmentType)?.label || ""],
                          ["جهة العمل", formData.employer],
                          ["الراتب الشهري", `${Number(formData.monthlySalary).toLocaleString("en")} د.ع`],
                        ].map(([label, value], i) => (
                          <div key={i} className="flex justify-between">
                            <span className="text-navy-500">{label}:</span>
                            <span className="text-navy-900 font-medium">{value || "—"}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Loan */}
                    <div>
                      <h4 className="font-bold text-navy-900 text-sm mb-3 flex items-center gap-2">
                        <Banknote className="w-4 h-4 text-gold-500" />
                        تفاصيل القرض
                      </h4>
                      <div className="bg-navy-50 rounded-2xl p-4 grid sm:grid-cols-2 gap-3 text-sm">
                        {[
                          ["الغرض", loanPurposes.find((p) => p.value === formData.loanPurpose)?.label || ""],
                          ["المبلغ", `${Number(formData.loanAmount).toLocaleString("en")} د.ع`],
                          ["ملاحظات", formData.notes || "—"],
                        ].map(([label, value], i) => (
                          <div key={i} className="flex justify-between">
                            <span className="text-navy-500">{label}:</span>
                            <span className="text-navy-900 font-medium">{value || "—"}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Documents */}
                    <div>
                      <h4 className="font-bold text-navy-900 text-sm mb-3 flex items-center gap-2">
                        <Upload className="w-4 h-4 text-gold-500" />
                        المستندات المرفقة
                      </h4>
                      <div className="bg-navy-50 rounded-2xl p-4 grid sm:grid-cols-2 gap-3 text-sm">
                        {documentSlots.map((slot) => {
                          const file = documents[slot.key];
                          return (
                            <div key={slot.key} className="flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  file ? "bg-emerald-500" : slot.required ? "bg-red-400" : "bg-navy-300"
                                }`}
                              />
                              <span className="text-navy-600 text-xs">
                                {slot.label}: {file ? file.name : "لم يتم الرفع"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Agreement */}
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 mt-0.5 rounded border-navy-300 text-gold-500 focus:ring-gold-500"
                        required
                      />
                      <span className="text-sm text-navy-600">
                        أؤكد أن جميع البيانات والمستندات المقدمة صحيحة وأتحمل كامل المسؤولية القانونية عن أي معلومات غير دقيقة.
                      </span>
                    </label>
                  </div>

                  <div className="mt-8 flex justify-between">
                    <Button variant="outline" size="lg" onClick={handlePrev}>
                      <ArrowRight className="w-5 h-5" />
                      السابق
                    </Button>
                    <Button size="lg" onClick={handleSubmit} loading={submitting}>
                      <Check className="w-5 h-5" />
                      تقديم الطلب
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Container>
    </>
  );
}
