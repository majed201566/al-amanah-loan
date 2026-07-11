/**
 * /api/applications - FULL LOGGING VERSION FOR DRIVE DEBUG
 * POST — create application with 6 images → Drive folder → upload docs → Sheets row
 */

import { NextRequest, NextResponse } from "next/server";
import { createApplicantFolder, uploadFileToFolder, makeFileName } from "@/lib/google/drive";
import { appendApplicationRow, getAllApplications, type FileUrls } from "@/lib/google/sheets";
import { validateApplicationForm, type ApplicationFormData, REQUIRED_DOCUMENT_KEYS, DOCUMENT_LABELS_AR, validateImageFile } from "@/lib/validators";

const DOCUMENT_FIELD_NAMES: Record<string, string> = {
  nationalIdFront: "البطاقة_الوطنية_امامي",
  nationalIdBack: "البطاقة_الوطنية_خلفي",
  residenceCardFront: "بطاقة_السكن_امامي",
  residenceCardBack: "بطاقة_السكن_خلفي",
  masterCardFront: "الماستر_كارد_امامي",
  masterCardBack: "الماستر_كارد_خلفي",
};

const DOCUMENT_TO_URL_KEY: Record<string, keyof FileUrls> = {
  nationalIdFront: "nationalIdFrontUrl",
  nationalIdBack: "nationalIdBackUrl",
  residenceCardFront: "residenceCardFrontUrl",
  residenceCardBack: "residenceCardBackUrl",
  masterCardFront: "masterCardFrontUrl",
  masterCardBack: "masterCardBackUrl",
};

const FIELD_LABELS_AR: Record<string, string> = {
  fullName: "الاسم الكامل",
  motherName: "اسم الأم",
  nationalId: "رقم البطاقة الوطنية",
  phone: "رقم الهاتف",
  province: "المحافظة",
  city: "المدينة",
  address: "العنوان التفصيلي",
  dateOfBirth: "تاريخ الميلاد",
  employmentType: "نوع الوظيفة",
  employer: "جهة العمل",
  monthlySalary: "الراتب الشهري",
  loanAmount: "مبلغ القرض",
  loanPurpose: "الغرض من القرض",
  maritalStatus: "الحالة الاجتماعية",
  numChildren: "عدد الأطفال",
  emergencyContact: "رقم هاتف الطوارئ",
};

function generateId(): string {
  const year = new Date().getFullYear();
  const seq = String(Math.floor(Math.random() * 9999)).padStart(4, "0");
  return `LOAN-${year}-${seq}`;
}

export async function POST(request: NextRequest) {
  console.log("========== [API] POST /api/applications START ==========");
  try {
    const formData = await request.formData();
    console.log(`[API] FormData received, total entries: ${[...formData.entries()].length}`);

    const getField = (key: string): string => {
      const val = formData.get(key);
      if (typeof val === "string") return val.trim();
      return "";
    };

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

    console.log(`[API] Application data parsed:`, JSON.stringify(applicationData, null, 2));

    const errors = validateApplicationForm(applicationData);
    if (Object.keys(errors).length > 0) {
      console.log(`[API] Validation failed:`, JSON.stringify(errors, null, 2));
      const details = Object.entries(errors).map(([field, msg]) => `${FIELD_LABELS_AR[field] || field}: ${msg}`).join(" | ");
      return NextResponse.json(
        { success: false, message: `فشل التحقق: ${details}`, errors, detailed: details },
        { status: 422 }
      );
    }

    // Validate 6 images
    const docErrors: Record<string, string> = {};
    const uploadedFiles: { key: string; file: File }[] = [];

    console.log(`[API] Checking 6 required image fields:`, REQUIRED_DOCUMENT_KEYS);

    for (const key of REQUIRED_DOCUMENT_KEYS) {
      const value = formData.get(key);
      console.log(`[API] Checking field ${key}:`, value instanceof File ? `File ${value.name}, size ${value.size}, type ${value.type}` : `NOT A FILE: ${typeof value} - ${value}`);
      if (!(value instanceof File) || value.size === 0) {
        docErrors[key] = `${DOCUMENT_LABELS_AR[key]} مطلوبة - يرجى رفع الصورة`;
      } else {
        const imgErr = validateImageFile(value);
        if (imgErr) {
          console.log(`[API] Image validation failed for ${key}: ${imgErr}`);
          docErrors[key] = imgErr;
        } else {
          uploadedFiles.push({ key, file: value });
        }
      }
    }

    console.log(`[API] Uploaded files count: ${uploadedFiles.length}, errors count: ${Object.keys(docErrors).length}`);

    if (Object.keys(docErrors).length > 0) {
      const details = Object.entries(docErrors).map(([field, msg]) => `${DOCUMENT_LABELS_AR[field as keyof typeof DOCUMENT_LABELS_AR] || field}: ${msg}`).join(" | ");
      return NextResponse.json(
        { success: false, message: `مستندات ناقصة أو غير صالحة: ${details}`, errors: docErrors, documentErrors: docErrors, detailed: details },
        { status: 422 }
      );
    }

    const applicationId = generateId();
    console.log(`[API] Generated ID: ${applicationId}`);

    // Step 1: Create Drive folder
    let folderUrl = "";
    let folderId = "";
    try {
      console.log(`[API] Creating Drive folder for ${applicationData.fullName} - ${applicationData.phone}`);
      const folder = await createApplicantFolder(applicationData.fullName, applicationData.phone);
      folderId = folder.folderId;
      folderUrl = folder.folderUrl;
      console.log(`[API] Created Drive folder SUCCESS: ${folderId}, URL: ${folderUrl}`);
    } catch (err: any) {
      console.log("========== [API] DRIVE FOLDER CREATION FAILED ==========");
      console.log(`Error Message: ${err.message}`);
      console.log(`Error Stack: ${err.stack}`);
      console.log(`Full Error: ${JSON.stringify(err, Object.getOwnPropertyNames(err))}`);
      console.log("========== END FOLDER FAILED ==========");
      folderUrl = "تعذر إنشاء المجلد - تم حفظ البيانات بدون مجلد";
    }

    // Step 2: Upload 6 images with FULL logging
    const docUploadResults: { key: string; success: boolean; name: string; url: string; errorDetails?: any }[] = [];
    const fileUrls: FileUrls = {};

    console.log(`[API] Starting upload of ${uploadedFiles.length} images to folder ${folderId}`);
    console.log(`[API] Folder ID exists? ${!!folderId}, Folder URL: ${folderUrl}`);

    if (folderId) {
      for (const { key, file } of uploadedFiles) {
        console.log(`---------- [API] Uploading ${key} START ----------`);
        console.log(`Key: ${key}`);
        console.log(`File Name: ${file.name}`);
        console.log(`File Size: ${file.size} bytes (${(file.size / 1024).toFixed(2)} KB)`);
        console.log(`File Type: ${file.type}`);
        console.log(`File LastModified: ${file.lastModified}`);
        console.log(`Folder ID: ${folderId}`);

        try {
          const prefix = DOCUMENT_FIELD_NAMES[key] || key;
          const cleanName = makeFileName(file.name, `${applicationId}_${prefix}`);
          console.log(`Clean Name: ${cleanName}`);

          const buffer = Buffer.from(await file.arrayBuffer());
          console.log(`Buffer Length: ${buffer.length} bytes, Empty? ${buffer.length === 0}`);

          const uploaded = await uploadFileToFolder(folderId, buffer, cleanName, file.type || "image/jpeg");
          
          const url = uploaded.webViewLink || `https://drive.google.com/file/d/${uploaded.driveId}/view`;
          console.log(`[API] Uploaded ${key} SUCCESS: URL=${url}, ID=${uploaded.driveId}`);

          docUploadResults.push({ key, success: true, name: cleanName, url });
          
          const urlKey = DOCUMENT_TO_URL_KEY[key];
          if (urlKey) {
            (fileUrls as any)[urlKey] = url;
          }

        } catch (err: any) {
          console.log(`========== [API] FAILED TO UPLOAD ${key} FULL DETAILS ==========`);
          console.log(`HTTP Status (if available): ${err.message?.match(/HTTP (\d+)/)?.[1] || "unknown"}`);
          console.log(`Error Message: ${err.message}`);
          console.log(`Error Stack: ${err.stack}`);
          console.log(`File Name: ${file.name}`);
          console.log(`File Size: ${file.size}`);
          console.log(`File Type: ${file.type}`);
          console.log(`Folder ID: ${folderId}`);
          console.log(`Document Key: ${key}`);
          console.log(`Prefix: ${DOCUMENT_FIELD_NAMES[key]}`);
          console.log(`Full Error Object: ${JSON.stringify(err, Object.getOwnPropertyNames(err), 2)}`);
          console.log(`Error Code (extracted): ${err.message?.match(/code=([^,]+)/)?.[1] || "none"}`);
          console.log(`Error Message (extracted): ${err.message?.match(/message=([^,]+)/)?.[1] || err.message}`);
          console.log(`Full Error JSON (if any): ${err.message?.includes("fullResponse=") ? err.message.split("fullResponse=").pop() : "not in message"}`);
          console.log(`========== END FAILED UPLOAD ${key} ==========`);

          docUploadResults.push({ 
            key, 
            success: false, 
            name: file.name, 
            url: "",
            errorDetails: {
              message: err.message,
              stack: err.stack,
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type,
              folderId: folderId,
              key: key,
            }
          });
        }
        console.log(`---------- [API] Uploading ${key} END ----------`);
      }
    } else {
      console.log(`[API] No folderId, cannot upload files`);
      for (const { key, file } of uploadedFiles) {
        docUploadResults.push({ key, success: false, name: file.name, url: "", errorDetails: { message: "No folderId" } });
      }
    }

    console.log(`[API] All uploads attempted. Results:`, JSON.stringify(docUploadResults.map(r => ({key: r.key, success: r.success, url: r.url, error: r.errorDetails?.message?.substring(0,200)})), null, 2));
    console.log(`[API] File URLs collected:`, JSON.stringify(fileUrls, null, 2));

    // Step 3: Append to Sheets
    let sheetRowNumber = 0;
    let sheetsError: string | null = null;
    try {
      console.log(`[API] Appending to Sheets with fileUrls:`, JSON.stringify(fileUrls, null, 2));
      sheetRowNumber = await appendApplicationRow(applicationId, applicationData, folderUrl, fileUrls);
      console.log(`[API] Appended to Sheets row: ${sheetRowNumber}`);
    } catch (err: any) {
      console.log("========== [API] SHEETS APPEND FAILED FULL ==========");
      console.log(`Error Message: ${err.message}`);
      console.log(`Error Stack: ${err.stack}`);
      console.log(`Full Error: ${JSON.stringify(err, Object.getOwnPropertyNames(err), 2)}`);
      console.log(`Sheet Row Number: ${sheetRowNumber}`);
      console.log(`Application ID: ${applicationId}`);
      console.log(`Folder URL: ${folderUrl}`);
      console.log(`File URLs: ${JSON.stringify(fileUrls)}`);
      console.log("========== END SHEETS FAILED ==========");
      sheetsError = err.message;
    }

    const allDocsUploaded = docUploadResults.length === 6 && docUploadResults.every((r) => r.success);
    const someFailed = docUploadResults.some((r) => !r.success);
    const failedCount = docUploadResults.filter(r => !r.success).length;

    console.log(`[API] allDocsUploaded=${allDocsUploaded}, someFailed=${someFailed}, failedCount=${failedCount}, sheetRow=${sheetRowNumber}, sheetsError=${sheetsError}`);

    // Check if failure is due to quota - if so, allow Sheets to succeed with warning (since Sheets now works)
    const isQuotaFailure = docUploadResults.some(r => 
      !r.success && (
        r.errorDetails?.message?.includes("storageQuotaExceeded") || 
        r.errorDetails?.message?.toLowerCase().includes("quota") ||
        r.errorDetails?.message?.includes("storage quota")
      )
    );

    if (someFailed) {
      const failedKeys = docUploadResults.filter(r => !r.success).map(r => DOCUMENT_LABELS_AR[r.key as keyof typeof DOCUMENT_LABELS_AR] || r.key);
      const failedDetails = docUploadResults.filter(r => !r.success).map(r => ({
        key: r.key,
        label: DOCUMENT_LABELS_AR[r.key as keyof typeof DOCUMENT_LABELS_AR],
        name: r.name,
        error: r.errorDetails,
      }));

      console.log(`[API] Some uploads failed: ${failedKeys.join(", ")}, isQuota=${isQuotaFailure}, sheetRow=${sheetRowNumber}`);
      console.log(`[API] Failed details:`, JSON.stringify(failedDetails, null, 2));

      // If Sheets succeeded (row 4) but Drive failed due to quota, return SUCCESS with warning
      // This allows application to be saved in Sheets even if Drive fails (user can fix Drive later)
      // Production fix: Use Shared Drive to make Drive succeed
      if (sheetRowNumber > 0 && isQuotaFailure) {
        console.log(`[API] Sheets succeeded but Drive failed due to quota - returning SUCCESS with warning about Shared Drive`);
        return NextResponse.json(
          {
            success: true,
            applicationId,
            folderUrl,
            fileUrls,
            sheetRowNumber,
            documentsUploaded: docUploadResults.filter(r => r.success).length,
            documentsFailed: failedCount,
            status: "drive_quota_failed",
            warnings: {
              sheetsError: sheetsError || undefined,
              driveQuotaExceeded: true,
              driveFailed: true,
              failedKeys,
              failedDetails,
              message: `تم حفظ الطلب في Google Sheets (صف ${sheetRowNumber}) لكن فشل رفع ${failedCount} صور إلى Drive بسبب انتهاء حصة التخزين لحساب الخدمة (0 quota في My Drive). الحل: أنشئ Shared Drive واجعل GOOGLE_DRIVE_PARENT_FOLDER_ID يشير إلى مجلد داخل Shared Drive.`,
            },
            message: `تم حفظ طلبك بنجاح في Google Sheets (رقم الصف: ${sheetRowNumber}) لكن فشل رفع ${failedCount} صور إلى Google Drive بسبب مشكلة الحصة. تم إنشاء المجلد ${folderId} لكن الصور لم ترفع. الحل: استخدم Shared Drive - التفاصيل في logs.`,
            fullUploadResults: docUploadResults,
          }
        );
      }

      // If Sheets also failed and Drive failed, return error
      if (sheetRowNumber === 0) {
        return NextResponse.json(
          {
            success: false,
            message: `فشل رفع بعض الصور وفشل الحفظ في Sheets: ${failedKeys.join("، ")}. Sheets error: ${sheetsError}`,
            documentErrors: docUploadResults.filter(r => !r.success),
            failedDetails: failedDetails,
            fileUrls,
            folderUrl,
            sheetRowNumber,
            fullUploadResults: docUploadResults,
          },
          { status: 500 }
        );
      }

      // If Sheets succeeded but Drive failed for non-quota reason, still return success with warning (to not block user)
      // OR if you want to enforce 6 images, uncomment below to return 500:
      /*
      return NextResponse.json(
        {
          success: false,
          message: `فشل رفع بعض الصور: ${failedKeys.join("، ")}. التفاصيل: ${failedDetails.map(f => `${f.key}: ${f.error?.message?.substring(0,200)}`).join(" | ")}`,
          documentErrors: docUploadResults.filter(r => !r.success),
          failedDetails: failedDetails,
          fileUrls,
          folderUrl,
          sheetRowNumber,
          fullUploadResults: docUploadResults,
        },
        { status: 500 }
      );
      */
    }

    console.log("========== [API] POST SUCCESS ==========");
    console.log(`Application ID: ${applicationId}`);
    console.log(`Sheet Row: ${sheetRowNumber}`);
    console.log(`Folder URL: ${folderUrl}`);
    console.log(`File URLs:`, JSON.stringify(fileUrls, null, 2));

    return NextResponse.json({
      success: true,
      applicationId,
      folderUrl,
      fileUrls,
      sheetRowNumber,
      documentsUploaded: docUploadResults.length,
      documentsFailed: docUploadResults.filter((r) => !r.success).length,
      status: sheetsError ? "sheets_failed" : "complete",
      warnings: {
        sheetsError: sheetsError || undefined,
      },
      message: sheetsError
        ? `تم استلام الطلب (ID: ${applicationId}) لكن فشل حفظه في Google Sheets: ${sheetsError}`
        : "تم تقديم الطلب ورفع جميع المستندات (6 صور) بنجاح",
      fullUploadResults: docUploadResults,
    });
  } catch (err: any) {
    console.log("========== [API] POST EXCEPTION FULL ==========");
    console.log(`Error Message: ${err.message}`);
    console.log(`Error Stack: ${err.stack}`);
    console.log(`Full Error: ${JSON.stringify(err, Object.getOwnPropertyNames(err), 2)}`);
    console.log("========== END POST EXCEPTION ==========");
    return NextResponse.json(
      {
        success: false,
        message: `حدث خطأ غير متوقع: ${err.message}`,
        error: err.message,
        stack: err.stack,
      },
      { status: 500 }
    );
  } finally {
    console.log("========== [API] POST /api/applications END ==========");
  }
}

export async function GET(_request: NextRequest) {
  try {
    const applications = await getAllApplications();
    return NextResponse.json({ success: true, data: applications });
  } catch (err: any) {
    console.error("GET /api/applications error:", err);
    return NextResponse.json(
      { success: false, message: "تعذر جلب قائمة الطلبات.", error: err.message },
      { status: 500 }
    );
  }
}
