/**
 * Client-side service for the loan application API.
 * Wraps fetch calls to /api/applications with error handling.
 */

import type { ApplicationFormData, FormErrors } from "@/lib/validators";

export interface ApiResponse {
  success: boolean;
  message?: string;
  applicationId?: string;
  folderUrl?: string;
  documentsUploaded?: number;
  documentsFailed?: number;
  status?: string;
  errors?: FormErrors;
  firstErrorField?: string;
  firstErrorMessage?: string;
  detailed?: string;
  error?: string;
  warnings?: {
    sheetsError?: string;
    driveFailed?: boolean;
  };
  sheetRowNumber?: number;
}

export class ApiValidationError extends Error {
  errors: FormErrors;
  firstField?: string;
  detailed?: string;
  constructor(message: string, errors: FormErrors, firstField?: string, detailed?: string) {
    super(message);
    this.name = "ApiValidationError";
    this.errors = errors;
    this.firstField = firstField;
    this.detailed = detailed;
  }
}

export interface SheetApplication {
  id: string;
  createdAt: string;
  status: string;
  fullName: string;
  motherName: string;
  nationalId: string;
  phone: string;
  province: string;
  city: string;
  address: string;
  dateOfBirth: string;
  maritalStatus: string;
  numChildren: string;
  emergencyContact: string;
  employmentType: string;
  employer: string;
  monthlySalary: string;
  loanPurpose: string;
  loanAmount: string;
  notes: string;
  folderUrl: string;
  statusNote: string;
  updatedAt: string;
  rowNumber: number;
}

/**
 * Submit a new loan application.
 * Sends multipart/form-data with text fields + files.
 */
export async function submitApplication(
  formData: ApplicationFormData,
  documents: Record<string, File | null>
): Promise<ApiResponse> {
  const body = new FormData();

  // Append all text fields - trim to ensure consistency
  for (const [key, value] of Object.entries(formData)) {
    body.append(key, (value as string) || "");
  }

  // Append files
  for (const [key, file] of Object.entries(documents)) {
    if (file) {
      body.append(key, file, file.name);
    }
  }

  console.log("[API Client] Submitting application with fields:", Object.keys(formData), "files:", Object.entries(documents).filter(([, f]) => !!f).map(([k]) => k));

  const response = await fetch("/api/applications", {
    method: "POST",
    body,
    // Do NOT set Content-Type — browser sets it with boundary for multipart
  });

  let result: ApiResponse;
  try {
    result = await response.json();
  } catch (e) {
    console.error("[API Client] Failed to parse JSON response", e);
    throw new Error("فشل في قراءة استجابة الخادم. يرجى المحاولة مرة أخرى.");
  }

  console.log("[API Client] Response:", response.status, result);

  if (!response.ok || !result.success) {
    // If validation error with field details, throw ApiValidationError to allow UI to show field errors
    if (result.errors && Object.keys(result.errors).length > 0) {
      const detailedMsg = result.message || result.detailed || `فشل التحقق: ${Object.entries(result.errors).map(([k, v]) => `${k}: ${v}`).join(" | ")}`;
      throw new ApiValidationError(detailedMsg, result.errors, result.firstErrorField, result.detailed);
    }
    throw new Error(result.message || result.error || "حدث خطأ أثناء تقديم الطلب");
  }

  return result;
}

/**
 * Fetch all applications.
 */
export async function fetchApplications(): Promise<SheetApplication[]> {
  const response = await fetch("/api/applications");

  if (!response.ok) {
    throw new Error("تعذر جلب قائمة الطلبات");
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.message || "تعذر جلب قائمة الطلبات");
  }

  return result.data || [];
}

/**
 * Fetch a single application by ID.
 */
export async function fetchApplication(
  id: string
): Promise<SheetApplication | null> {
  const response = await fetch(`/api/applications/${id}`);

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error("تعذر جلب بيانات الطلب");
  }

  const result = await response.json();
  return result.data || null;
}
