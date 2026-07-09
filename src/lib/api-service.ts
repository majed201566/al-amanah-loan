/**
 * Client-side service for the loan application API.
 * Wraps fetch calls to /api/applications with error handling.
 */

import type { ApplicationFormData } from "@/lib/validators";

export interface ApiResponse {
  success: boolean;
  message?: string;
  applicationId?: string;
  folderUrl?: string;
  documentsUploaded?: number;
  documentsFailed?: number;
  status?: string;
  errors?: Record<string, string>;
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

  // Append all text fields
  for (const [key, value] of Object.entries(formData)) {
    body.append(key, value);
  }

  // Append files
  for (const [key, file] of Object.entries(documents)) {
    if (file) {
      body.append(key, file, file.name);
    }
  }

  const response = await fetch("/api/applications", {
    method: "POST",
    body,
    // Do NOT set Content-Type — browser sets it with boundary for multipart
  });

  const result: ApiResponse = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "حدث خطأ أثناء تقديم الطلب");
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
