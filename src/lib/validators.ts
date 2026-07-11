/**
 * Iraqi-specific validation utilities for the loan application.
 */

// ── National ID (Iraqi) ──
export function validateNationalId(id: string): string | null {
  const cleaned = id.replace(/[\s\-]/g, "");

  if (!cleaned) return "رقم البطاقة الوطنية مطلوب";

  if (!/^\d{10,14}$/.test(cleaned)) {
    return "رقم البطاقة الوطنية يجب أن يتكون من 10-14 أرقام";
  }

  return null;
}

// ── Iraqi Phone ──
export function validateIraqiPhone(phone: string): string | null {
  if (!phone || phone.trim().length < 8) {
    return "يرجى إدخال رقم الهاتف";
  }

  const cleaned = phone.replace(/[\s\-\(\)\+]/g, "");
  const digits = cleaned.replace(/^964/, "").replace(/^0/, "");

  if (!/^7\d{9}$/.test(digits)) {
    return "رقم هاتف عراقي غير صالح (مثال: 0770 123 4567)";
  }

  return null;
}

// ── Required Text ──
export function validateRequired(value: string, fieldName: string, minLen = 1): string | null {
  if (!value || value.trim().length < minLen) {
    return `${fieldName} مطلوب${minLen > 1 ? ` (${minLen} أحرف على الأقل)` : ""}`;
  }
  return null;
}

// ── Date of Birth (must be 21-65 years old) ──
export function validateDateOfBirth(dob: string): string | null {
  if (!dob) return "تاريخ الميلاد مطلوب";

  const birth = new Date(dob);
  const today = new Date();

  if (isNaN(birth.getTime())) return "تاريخ ميلاد غير صالح";

  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  if (age < 21) return "يجب أن يكون عمرك 21 عاماً على الأقل";
  if (age > 65) return "العمر الأقصى للتقديم هو 65 عاماً";

  return null;
}

// ── Salary ──
export function validateSalary(salary: string): string | null {
  if (!salary) return "الراتب الشهري مطلوب";
  const num = Number(salary);
  if (isNaN(num) || num < 500000) {
    return "الحد الأدنى للراتب الشهري هو 500,000 دينار عراقي";
  }
  if (num > 50000000) {
    return "الحد الأقصى للراتب المسجل هو 50,000,000 دينار";
  }
  return null;
}

// ── Loan Amount ──
export function validateLoanAmount(amount: string, salary: string): string | null {
  if (!amount) return "مبلغ القرض مطلوب";
  const loanNum = Number(amount);
  const salaryNum = Number(salary) || 0;

  if (isNaN(loanNum) || loanNum < 1000000) {
    return "الحد الأدنى للقرض هو 1,000,000 دينار عراقي";
  }

  if (salaryNum > 0 && loanNum > salaryNum * 60) {
    return "مبلغ القرض يتجاوز الحد المسموح (60 × الراتب الشهري)";
  }

  return null;
}

// ── Children Count ──
export function validateChildrenCount(count: string): string | null {
  if (count === "" || count === undefined || count === null) return null;
  const num = Number(count);
  if (isNaN(num) || num < 0 || num > 20) {
    return "عدد الأطفال يجب أن يكون بين 0 و 20";
  }
  return null;
}

// ── File Validation ──
// Original allowed types (kept for backward compat, but new image fields use image-only)
export const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf",
];

// New: Image-only for the 6 required fields
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB for images

export function validateFile(file: File): string | null {
  if (!ALLOWED_FILE_TYPES.includes(file.type) && file.type !== "") {
    return "نوع الملف غير مدعوم. الأنواع المدعومة: JPG, PNG, WebP, HEIC, PDF";
  }

  if (file.size > MAX_FILE_SIZE) {
    return `حجم الملف كبير جداً. الحد الأقصى: ${MAX_FILE_SIZE / 1024 / 1024} ميغابايت`;
  }

  return null;
}

export function validateImageFile(file: File): string | null {
  // Accept image/* only, reject PDF and others
  const isImage = file.type.startsWith("image/") || ALLOWED_IMAGE_TYPES.includes(file.type);
  
  if (!isImage) {
    return "يجب رفع صورة فقط. الأنواع المدعومة: JPG, PNG, WebP, HEIC";
  }

  if (file.type && !ALLOWED_IMAGE_TYPES.includes(file.type) && !file.type.startsWith("image/")) {
    // Extra safety, but above check already covers image/*
    return "نوع الصورة غير مدعوم. استخدم JPG أو PNG أو WebP";
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return `حجم الصورة كبير جداً. الحد الأقصى: ${MAX_IMAGE_SIZE / 1024 / 1024} ميغابايت`;
  }

  // Check extension as fallback if mime type empty (some browsers)
  if (file.type === "" || file.type === "application/octet-stream") {
    const ext = file.name.toLowerCase().split(".").pop();
    const allowedExts = ["jpg", "jpeg", "png", "webp", "heic", "heif"];
    if (!ext || !allowedExts.includes(ext)) {
      return "يجب رفع صورة فقط. الأنواع المدعومة: JPG, PNG, WebP, HEIC";
    }
  }

  return null;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Document fields definition (6 required image fields) ──
export const REQUIRED_DOCUMENT_KEYS = [
  "nationalIdFront",
  "nationalIdBack",
  "residenceCardFront",
  "residenceCardBack",
  "masterCardFront",
  "masterCardBack",
] as const;

export type RequiredDocumentKey = typeof REQUIRED_DOCUMENT_KEYS[number];

export const DOCUMENT_LABELS_AR: Record<RequiredDocumentKey, string> = {
  nationalIdFront: "البطاقة الوطنية - الوجه الأمامي",
  nationalIdBack: "البطاقة الوطنية - الوجه الخلفي",
  residenceCardFront: "بطاقة السكن - الوجه الأمامي",
  residenceCardBack: "بطاقة السكن - الوجه الخلفي",
  masterCardFront: "الماستر كارد - الوجه الأمامي",
  masterCardBack: "الماستر كارد - الوجه الخلفي",
};

export const DOCUMENT_LABELS_EN: Record<RequiredDocumentKey, string> = {
  nationalIdFront: "National ID Card - Front",
  nationalIdBack: "National ID Card - Back",
  residenceCardFront: "Residence Card - Front",
  residenceCardBack: "Residence Card - Back",
  masterCardFront: "MasterCard - Front",
  masterCardBack: "MasterCard - Back",
};

// ── Form-level validation ──
export interface ApplicationFormData {
  fullName: string;
  motherName: string;
  nationalId: string;
  phone: string;
  province: string;
  city: string;
  address: string;
  dateOfBirth: string;
  employmentType: string;
  employer: string;
  monthlySalary: string;
  loanAmount: string;
  loanPurpose: string;
  maritalStatus: string;
  numChildren: string;
  emergencyContact: string;
  notes: string;
}

export type FormErrors = Partial<Record<keyof ApplicationFormData, string>> & {
  documents?: string;
};

export function validateApplicationForm(data: ApplicationFormData): FormErrors {
  const errors: FormErrors = {};

  // Required text fields
  const requiredFields: { key: keyof ApplicationFormData; label: string; min?: number }[] = [
    { key: "fullName", label: "الاسم الكامل", min: 4 },
    { key: "motherName", label: "اسم الأم", min: 3 },
    { key: "province", label: "المحافظة" },
    { key: "city", label: "المدينة" },
    { key: "address", label: "العنوان", min: 5 },
    { key: "employmentType", label: "نوع الوظيفة" },
    { key: "employer", label: "جهة العمل" },
    { key: "loanPurpose", label: "الغرض من القرض" },
    { key: "maritalStatus", label: "الحالة الاجتماعية" },
  ];

  for (const { key, label, min } of requiredFields) {
    const err = validateRequired(data[key], label, min);
    if (err) errors[key] = err;
  }

  // National ID
  const idErr = validateNationalId(data.nationalId);
  if (idErr) errors.nationalId = idErr;

  // Phone
  const phoneErr = validateIraqiPhone(data.phone);
  if (phoneErr) errors.phone = phoneErr;

  // Date of Birth
  const dobErr = validateDateOfBirth(data.dateOfBirth);
  if (dobErr) errors.dateOfBirth = dobErr;

  // Salary
  const salaryErr = validateSalary(data.monthlySalary);
  if (salaryErr) errors.monthlySalary = salaryErr;

  // Loan amount
  const loanErr = validateLoanAmount(data.loanAmount, data.monthlySalary);
  if (loanErr) errors.loanAmount = loanErr;

  // Children (optional but validate if provided)
  if (data.numChildren) {
    const childErr = validateChildrenCount(data.numChildren);
    if (childErr) errors.numChildren = childErr;
  }

  // Emergency contact (optional but validate if provided)
  if (data.emergencyContact && data.emergencyContact.trim() !== "") {
    const emPhoneErr = validateIraqiPhone(data.emergencyContact);
    if (emPhoneErr) errors.emergencyContact = emPhoneErr;
  }

  return errors;
}

export function validateDocuments(documents: Record<string, File | null>): Record<string, string> {
  const errors: Record<string, string> = {};
  
  for (const key of REQUIRED_DOCUMENT_KEYS) {
    const file = documents[key];
    if (!file) {
      errors[key] = `${DOCUMENT_LABELS_AR[key]} مطلوبة - يرجى رفع الصورة`;
    } else {
      const imgErr = validateImageFile(file);
      if (imgErr) {
        errors[key] = imgErr;
      }
    }
  }
  
  return errors;
}
