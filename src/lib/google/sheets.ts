/**
 * Google Sheets via REST API - Fixed for 404 NOT_FOUND issues
 *
 * Sheet columns (29 columns A-AC):
 *   A: رقم الطلب   B: تاريخ التقديم   C: حالة الطلب   D: الاسم الكامل
 *   E: اسم الأم     F: رقم البطاقة      G: رقم الهاتف    H: المحافظة
 *   I: المدينة     J: العنوان           K: تاريخ الميلاد L: الحالة الاجتماعية
 *   M: عدد الأطفال  N: هاتف الطوارئ      O: نوع الوظيفة   P: جهة العمل
 *   Q: الراتب      R: الغرض             S: مبلغ القرض    T: ملاحظات
 *   U: رابط مجلد Drive
 *   V: رابط البطاقة الوطنية - أمامي
 *   W: رابط البطاقة الوطنية - خلفي
 *   X: رابط بطاقة السكن - أمامي
 *   Y: رابط بطاقة السكن - خلفي
 *   Z: رابط الماستر كارد - أمامي
 *   AA: رابط الماستر كارد - خلفي
 *   AB: حالة المراجعة      AC: تاريخ آخر تحديث
 */

import { getSheetId, googleApiRequest } from "./config";
import type { ApplicationFormData } from "@/lib/validators";

export const SHEET_HEADERS = [
  "رقم الطلب",
  "تاريخ التقديم",
  "حالة الطلب",
  "الاسم الكامل",
  "اسم الأم",
  "رقم البطاقة الوطنية",
  "رقم الهاتف",
  "المحافظة",
  "المدينة",
  "العنوان",
  "تاريخ الميلاد",
  "الحالة الاجتماعية",
  "عدد الأطفال",
  "هاتف الطوارئ",
  "نوع الوظيفة",
  "جهة العمل",
  "الراتب الشهري",
  "الغرض من القرض",
  "مبلغ القرض",
  "ملاحظات",
  "رابط مجلد Drive",
  // New 6 columns for separate Drive URLs per image
  "رابط البطاقة الوطنية - أمامي",
  "رابط البطاقة الوطنية - خلفي",
  "رابط بطاقة السكن - أمامي",
  "رابط بطاقة السكن - خلفي",
  "رابط الماستر كارد - أمامي",
  "رابط الماستر كارد - خلفي",
  "حالة المراجعة",
  "تاريخ آخر تحديث",
];

const employmentTypeLabels: Record<string, string> = {
  government: "موظف حكومي",
  private: "موظف قطاع خاص",
  self_employed: "عمل حر",
  retired: "متقاعد",
  business_owner: "صاحب عمل",
};
const maritalStatusLabels: Record<string, string> = {
  single: "أعزب",
  married: "متزوج",
  divorced: "مطلق",
  widowed: "أرمل",
};
const loanPurposeLabels: Record<string, string> = {
  personal: "احتياجات شخصية",
  housing: "شراء منزل",
  renovation: "ترميم عقار",
  business: "تمويل مشروع",
  education: "تعليم",
  medical: "علاج طبي",
  car: "شراء سيارة",
  debt: "تسوية ديون",
  wedding: "زواج",
  other: "أخرى",
};

export interface FileUrls {
  nationalIdFrontUrl?: string;
  nationalIdBackUrl?: string;
  residenceCardFrontUrl?: string;
  residenceCardBackUrl?: string;
  masterCardFrontUrl?: string;
  masterCardBackUrl?: string;
}

function buildRow(
  id: string,
  data: ApplicationFormData,
  folderUrl: string,
  fileUrls: FileUrls = {}
): string[] {
  const now = new Date().toISOString();
  return [
    id,
    now,
    "قيد الانتظار",
    data.fullName,
    data.motherName,
    data.nationalId,
    data.phone,
    data.province,
    data.city,
    data.address,
    data.dateOfBirth,
    maritalStatusLabels[data.maritalStatus] || data.maritalStatus,
    data.numChildren || "0",
    data.emergencyContact || "",
    employmentTypeLabels[data.employmentType] || data.employmentType,
    data.employer,
    data.monthlySalary,
    loanPurposeLabels[data.loanPurpose] || data.loanPurpose,
    data.loanAmount,
    data.notes || "",
    folderUrl || "",
    // New 6 URLs - keep order consistent with headers
    fileUrls.nationalIdFrontUrl || "",
    fileUrls.nationalIdBackUrl || "",
    fileUrls.residenceCardFrontUrl || "",
    fileUrls.residenceCardBackUrl || "",
    fileUrls.masterCardFrontUrl || "",
    fileUrls.masterCardBackUrl || "",
    "تم تقديم الطلب بنجاح",
    now,
  ];
}

const SHEETS_BASE = "https://sheets.googleapis.com/v4/spreadsheets";

// ── Get spreadsheet metadata to verify existence and get first sheet title ──
async function getSpreadsheetMetadata(sheetId: string): Promise<{ title: string; firstSheetTitle: string } | null> {
  try {
    console.log(`[Sheets] Fetching spreadsheet metadata for ID: ${sheetId.substring(0, 10)}...`);
    const res = await googleApiRequest(`${SHEETS_BASE}/${sheetId}?fields=properties.title,sheets.properties.title`);
    const json = await res.json();
    
    if (!res.ok) {
      console.error(`[Sheets] Metadata fetch failed - Status: ${res.status}`, JSON.stringify(json, null, 2));
      if (res.status === 404) {
        throw new Error(
          `Spreadsheet not found (404). Possible causes:
1. GOOGLE_SHEET_ID is incorrect: ${sheetId.substring(0, 15)}...
2. Sheet not shared with service account. Share with: service account client_email as Editor
3. Sheet was deleted or moved to trash
4. Sheet ID contains extra spaces or quotes - check env var
Full error: ${json.error?.message || JSON.stringify(json)}`
        );
      }
      throw new Error(`Metadata fetch failed (${res.status}): ${json.error?.message || JSON.stringify(json)}`);
    }

    const firstSheetTitle = json.sheets?.[0]?.properties?.title || "Sheet1";
    console.log(`[Sheets] Spreadsheet found: "${json.properties?.title}", first sheet: "${firstSheetTitle}"`);
    return {
      title: json.properties?.title || "",
      firstSheetTitle,
    };
  } catch (err: any) {
    if (err.message?.includes("Spreadsheet not found")) throw err;
    console.error(`[Sheets] Exception in getSpreadsheetMetadata:`, err);
    throw err;
  }
}

export async function ensureHeaders(): Promise<void> {
  const sheetId = getSheetId();
  
  try {
    // First, verify spreadsheet exists and get first sheet name
    const metadata = await getSpreadsheetMetadata(sheetId);
    const sheetName = metadata?.firstSheetTitle || "Sheet1";
    
    console.log(`[Sheets] Checking headers in sheet: ${sheetName}`);

    // Try to read headers from A1:AC1 (first sheet, no explicit sheet name - uses first sheet)
    // Using A1:AC1 without sheet name defaults to first sheet
    let res = await googleApiRequest(
      `${SHEETS_BASE}/${sheetId}/values/A1:AC1`
    );
    let json = await res.json();

    if (!res.ok) {
      console.error(`[Sheets] Failed to read headers A1:AC1 - Status: ${res.status}`, JSON.stringify(json, null, 2));
      // If 404, try with explicit sheet name
      if (res.status === 404) {
        console.log(`[Sheets] Trying with explicit sheet name: ${sheetName}!A1:AC1`);
        const encodedSheetName = encodeURIComponent(sheetName);
        res = await googleApiRequest(
          `${SHEETS_BASE}/${sheetId}/values/${encodedSheetName}!A1:AC1`
        );
        json = await res.json();
        if (!res.ok) {
          console.error(`[Sheets] Failed to read headers with sheet name - Status: ${res.status}`, JSON.stringify(json, null, 2));
          throw new Error(`Failed to read sheet headers (404): Sheet "${sheetName}" or range A1:AC1 not found. Check if sheet exists and service account has access. Error: ${json.error?.message}`);
        }
      } else {
        throw new Error(`Failed to read headers (${res.status}): ${json.error?.message}`);
      }
    }

    const existing = json.values?.[0] || [];
    console.log(`[Sheets] Existing headers count: ${existing.length}, expected: ${SHEET_HEADERS.length}`);

    // Check if needs update (less columns or missing new image URL columns)
    const needsUpdate =
      existing.length < SHEET_HEADERS.length ||
      !existing.includes("رابط البطاقة الوطنية - أمامي") ||
      !existing.includes("رابط الماستر كارد - خلفي") ||
      existing[0] !== "رقم الطلب";

    if (!needsUpdate) {
      console.log(`[Sheets] Headers already up-to-date, skipping update`);
      return;
    }

    console.log(`[Sheets] Updating headers to ${SHEET_HEADERS.length} columns (including 6 image URL columns)`);

    // Write headers to A1:AC1
    const putRes = await googleApiRequest(
      `${SHEETS_BASE}/${sheetId}/values/A1:AC1?valueInputOption=RAW`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values: [SHEET_HEADERS] }),
      }
    );

    const putJson = await putRes.json();
    if (!putRes.ok) {
      console.error(`[Sheets] Failed to write headers - Status: ${putRes.status}`, JSON.stringify(putJson, null, 2));
      throw new Error(`Failed to write headers (${putRes.status}): ${putJson.error?.message}`);
    }

    console.log(`[Sheets] Headers updated successfully: ${putJson.updatedRange}`);
  } catch (err: any) {
    console.error(`[Sheets] ensureHeaders failed:`, err);
    throw err; // Rethrow to be caught by caller, which will show detailed error
  }
}

export async function appendApplicationRow(
  id: string,
  formData: ApplicationFormData,
  folderUrl: string,
  fileUrls: FileUrls = {}
): Promise<number> {
  const sheetId = getSheetId();
  
  try {
    await ensureHeaders();
  } catch (e) {
    console.error(`[Sheets] ensureHeaders threw, but continuing to append attempt:`, e);
    // Continue anyway, append might still work
  }

  const row = buildRow(id, formData, folderUrl, fileUrls);
  console.log(`[Sheets] Appending row for ID ${id}, ${row.length} columns, folderUrl: ${folderUrl.substring(0,30)}...`);

  // FIX: Use A1:append instead of A:AC:append to avoid ambiguous colon parsing
  // The range A1 tells API to append starting at A1, it will auto-detect columns from data
  // Using A:AC:append has 2 colons which can be misparsed. A1:append is unambiguous and recommended.
  const appendUrl = `${SHEETS_BASE}/${sheetId}/values/A1:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;

  try {
    const res = await googleApiRequest(appendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ values: [row] }),
    });

    const json = await res.json();

    if (!res.ok) {
      console.error(`[Sheets] Append failed - Status: ${res.status}`, JSON.stringify(json, null, 2));
      
      let detailedMsg = json.error?.message || res.statusText;
      
      if (res.status === 404) {
        detailedMsg = `Spreadsheet not found (404) - Requested entity was not found.
Possible causes:
1. GOOGLE_SHEET_ID incorrect or sheet deleted: ${sheetId.substring(0,15)}...
2. Sheet not shared with service account. You MUST share the sheet with service account email (client_email from JSON) as Editor.
   - Open Sheet > Share > Add email: ${"service account email"} > Editor
3. Google Sheets API not enabled in GCP
4. Service account JSON is for wrong project

To fix:
- Go to https://docs.google.com/spreadsheets/d/${sheetId}/edit
- Click Share, add service account email, give Editor access
- Ensure API is enabled: https://console.cloud.google.com/apis/library/sheets.googleapis.com

Original error: ${json.error?.message} (code ${json.error?.code}, status ${json.error?.status})`;
      }

      throw new Error(`Sheets append failed (${res.status}): ${detailedMsg}`);
    }

    console.log(`[Sheets] Append successful: ${json.updates?.updatedRange}, ${json.updates?.updatedRows} rows`);
    
    const updatedRange = json.updates?.updatedRange || "";
    const m = updatedRange.match(/\d+$/);
    return m ? parseInt(m[0], 10) : 0;
  } catch (err: any) {
    if (err.message?.includes("Sheets append failed")) throw err;
    console.error(`[Sheets] Exception during append:`, err);
    throw new Error(`Sheets append exception: ${err.message}`);
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
  // New individual file URLs
  nationalIdFrontUrl: string;
  nationalIdBackUrl: string;
  residenceCardFrontUrl: string;
  residenceCardBackUrl: string;
  masterCardFrontUrl: string;
  masterCardBackUrl: string;
  statusNote: string;
  updatedAt: string;
  rowNumber: number;
}

export async function getAllApplications(): Promise<SheetApplication[]> {
  const sheetId = getSheetId();
  try {
    // Use A2:AC to get from row 2 to bottom, columns A-AC (29 cols)
    const res = await googleApiRequest(
      `${SHEETS_BASE}/${sheetId}/values/A2:AC`
    );
    const json = await res.json();
    
    if (!res.ok) {
      console.error(`[Sheets] getAllApplications failed - Status: ${res.status}`, JSON.stringify(json, null, 2));
      return [];
    }

    const rows: string[][] = json.values || [];
    console.log(`[Sheets] Fetched ${rows.length} rows`);
    
    return rows
      .map((row, i) => ({
        id: row[0] || "",
        createdAt: row[1] || "",
        status: row[2] || "",
        fullName: row[3] || "",
        motherName: row[4] || "",
        nationalId: row[5] || "",
        phone: row[6] || "",
        province: row[7] || "",
        city: row[8] || "",
        address: row[9] || "",
        dateOfBirth: row[10] || "",
        maritalStatus: row[11] || "",
        numChildren: row[12] || "",
        emergencyContact: row[13] || "",
        employmentType: row[14] || "",
        employer: row[15] || "",
        monthlySalary: row[16] || "",
        loanPurpose: row[17] || "",
        loanAmount: row[18] || "",
        notes: row[19] || "",
        folderUrl: row[20] || "",
        // New 6 URLs
        nationalIdFrontUrl: row[21] || "",
        nationalIdBackUrl: row[22] || "",
        residenceCardFrontUrl: row[23] || "",
        residenceCardBackUrl: row[24] || "",
        masterCardFrontUrl: row[25] || "",
        masterCardBackUrl: row[26] || "",
        statusNote: row[27] || "",
        updatedAt: row[28] || "",
        rowNumber: i + 2,
      }))
      .filter((r) => r.id);
  } catch (e) {
    console.error("[Sheets] getAllApplications exception:", e);
    return [];
  }
}

export async function getApplicationById(id: string): Promise<SheetApplication | null> {
  const all = await getAllApplications();
  return all.find((a) => a.id === id) || null;
}
