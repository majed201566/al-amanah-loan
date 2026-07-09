/**
 * /api/applications
 *
 * GET  — list all applications from Google Sheets
 * POST — create a new application (FormData: fields + files)
 *        → Drive folder → upload docs → Sheets row → response
 */

import { NextRequest, NextResponse } from "next/server";
import { createApplicantFolder, uploadFileToFolder, makeFileName } from "@/lib/google/drive";
import { appendApplicationRow, getAllApplications } from "@/lib/google/sheets";
import { validateApplicationForm, type ApplicationFormData } from "@/lib/validators";

// Document field keys that map to Arabic names
const DOCUMENT_FIELD_NAMES: Record<string, string> = {
  idFront: "وجه_البطاقة_الأمامي",
  idBack: "وجه_البطاقة_الخلفي",
  residenceCard: "بطاقة_السكن",
  salaryCard: "بطاقة_الراتب",
  selfieWithId: "صورة_شخصية_مع_البطاقة",
  other: "مستندات_أخرى",
};

function generateId(): string {
  const year = new Date().getFullYear();
  const seq = String(Math.floor(Math.random() * 9999)).padStart(4, "0");
  return `LOAN-${year}-${seq}`;
}

export async function POST(request: NextRequest) {
  try {
    // ── Parse multipart form data ──
    const formData = await request.formData();

    // Extract text fields
    const getField = (key: string): string =>
      (formData.get(key) as string) || "";

    const applicationData: ApplicationFormData = {
      fullName: getField("fullName"),
      motherName: getField("motherName"),
      nationalId: getField("nationalId"),
      phone: getField("phone"),
      province: getField("province"),
      city: getField("city"),
      address: getField("address"),
      dateOfBirth: getField("dateOfBirth"),
      employmentType: getField("employmentType"),
      employer: getField("employer"),
      monthlySalary: getField("monthlySalary"),
      loanAmount: getField("loanAmount"),
      loanPurpose: getField("loanPurpose"),
      maritalStatus: getField("maritalStatus"),
      numChildren: getField("numChildren"),
      emergencyContact: getField("emergencyContact"),
      notes: getField("notes"),
    };

    // ── Validate ──
    const errors = validateApplicationForm(applicationData);
    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { success: false, message: "يرجى تصحيح الأخطاء في النموذج", errors },
        { status: 422 }
      );
    }

    // ── Generate ID ──
    const applicationId = generateId();

    // ── Step 1: Create Drive folder ──
    let folderUrl = "";
    let folderId = "";

    try {
      const folder = await createApplicantFolder(
        applicationData.fullName,
        applicationData.phone
      );
      folderId = folder.folderId;
      folderUrl = folder.folderUrl;
    } catch (err: any) {
      console.error("Drive folder creation failed:", err.message);
      // Continue without folder — we still write to Sheets
      folderUrl = "تعذر إنشاء المجلد";
    }

    // ── Step 2: Upload documents ──
    const docUploadResults: { key: string; success: boolean; name: string }[] = [];

    if (folderId) {
      // Get all file entries from FormData
      const fileEntries: { key: string; file: File }[] = [];
      for (const [key, value] of formData.entries()) {
        if (value instanceof File && value.size > 0) {
          fileEntries.push({ key, file: value });
        }
      }

      // Upload each file sequentially (to avoid quota issues)
      for (const { key, file } of fileEntries) {
        try {
          const prefix = DOCUMENT_FIELD_NAMES[key] || key;
          const cleanName = makeFileName(file.name, prefix);
          const buffer = Buffer.from(await file.arrayBuffer());

          await uploadFileToFolder(folderId, buffer, cleanName, file.type);
          docUploadResults.push({ key, success: true, name: cleanName });
        } catch (err: any) {
          console.error(`Failed to upload ${key}:`, err.message);
          docUploadResults.push({ key, success: false, name: file.name });
        }
      }
    }

    // ── Step 3: Append to Google Sheets ──
    let sheetRowNumber = 0;
    try {
      sheetRowNumber = await appendApplicationRow(
        applicationId,
        applicationData,
        folderUrl
      );
    } catch (err: any) {
      console.error("Sheets append failed:", err.message);
      // If Sheets fails, we still return partial success
    }

    // ── Step 4: Build response ──
    const allDocsUploaded =
      docUploadResults.length > 0 &&
      docUploadResults.every((r) => r.success);

    const partialUploads =
      docUploadResults.some((r) => r.success) &&
      !allDocsUploaded;

    return NextResponse.json({
      success: true,
      applicationId,
      folderUrl,
      sheetRowNumber,
      documentsUploaded: docUploadResults.length,
      documentsFailed: docUploadResults.filter((r) => !r.success).length,
      status: partialUploads
        ? "partial"
        : "complete",
      message: allDocsUploaded
        ? "تم تقديم الطلب ورفع جميع المستندات بنجاح"
        : partialUploads
        ? "تم تقديم الطلب مع رفع جزئي للمستندات. يرجى مراجعة المستندات التي لم ترفع."
        : "تم تقديم الطلب بنجاح. يرجى التواصل مع الدعم لرفع المستندات.",
    });
  } catch (err: any) {
    console.error("POST /api/applications error:", err);
    return NextResponse.json(
      {
        success: false,
        message:
          "حدث خطأ غير متوقع أثناء معالجة طلبك. يرجى المحاولة مرة أخرى أو التواصل مع الدعم.",
      },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────
// GET — List all applications
// ─────────────────────────────────────────────────

export async function GET(_request: NextRequest) {
  try {
    const applications = await getAllApplications();
    return NextResponse.json({ success: true, data: applications });
  } catch (err: any) {
    console.error("GET /api/applications error:", err);
    return NextResponse.json(
      {
        success: false,
        message:
          "تعذر جلب قائمة الطلبات. يرجى المحاولة مرة أخرى.",
      },
      { status: 500 }
    );
  }
}
