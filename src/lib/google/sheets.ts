/**
 * Google Sheets via REST API.
 *
 * Sheet columns (row 1 = headers):
 *   A: رقم الطلب   B: تاريخ التقديم   C: حالة الطلب   D: الاسم الكامل
 *   E: اسم الأم     F: رقم البطاقة      G: رقم الهاتف    H: المحافظة
 *   I: المدينة     J: العنوان           K: تاريخ الميلاد L: الحالة الاجتماعية
 *   M: عدد الأطفال  N: هاتف الطوارئ      O: نوع الوظيفة   P: جهة العمل
 *   Q: الراتب      R: الغرض             S: مبلغ القرض    T: ملاحظات
 *   U: رابط Drive  V: حالة المراجعة      W: آخر تحديث
 */

import { getSheetId, googleApiRequest } from "./config";
import type { ApplicationFormData } from "@/lib/validators";

export const SHEET_HEADERS = [
  "رقم الطلب", "تاريخ التقديم", "حالة الطلب", "الاسم الكامل",
  "اسم الأم", "رقم البطاقة الوطنية", "رقم الهاتف", "المحافظة",
  "المدينة", "العنوان", "تاريخ الميلاد", "الحالة الاجتماعية",
  "عدد الأطفال", "هاتف الطوارئ", "نوع الوظيفة", "جهة العمل",
  "الراتب الشهري", "الغرض من القرض", "مبلغ القرض", "ملاحظات",
  "رابط مجلد Drive", "حالة المراجعة", "تاريخ آخر تحديث",
];

const employmentTypeLabels: Record<string, string> = {
  government: "موظف حكومي", private: "موظف قطاع خاص",
  self_employed: "عمل حر", retired: "متقاعد", business_owner: "صاحب عمل",
};
const maritalStatusLabels: Record<string, string> = {
  single: "أعزب", married: "متزوج", divorced: "مطلق", widowed: "أرمل",
};
const loanPurposeLabels: Record<string, string> = {
  personal: "احتياجات شخصية", housing: "شراء منزل", renovation: "ترميم عقار",
  business: "تمويل مشروع", education: "تعليم", medical: "علاج طبي",
  car: "شراء سيارة", debt: "تسوية ديون", wedding: "زواج", other: "أخرى",
};

function buildRow(id: string, data: ApplicationFormData, folderUrl: string): string[] {
  const now = new Date().toISOString();
  return [
    id, now, "قيد الانتظار", data.fullName, data.motherName,
    data.nationalId, data.phone, data.province, data.city, data.address,
    data.dateOfBirth, maritalStatusLabels[data.maritalStatus] || data.maritalStatus,
    data.numChildren || "0", data.emergencyContact || "",
    employmentTypeLabels[data.employmentType] || data.employmentType,
    data.employer, data.monthlySalary,
    loanPurposeLabels[data.loanPurpose] || data.loanPurpose,
    data.loanAmount, data.notes || "", folderUrl,
    "تم تقديم الطلب بنجاح", now,
  ];
}

const SHEETS_BASE = "https://sheets.googleapis.com/v4/spreadsheets";

export async function ensureHeaders(): Promise<void> {
  const sheetId = getSheetId();
  // Check row 1
  const res = await googleApiRequest(
    `${SHEETS_BASE}/${sheetId}/values/A1:W1`
  );
  const json = await res.json();
  const existing = json.values?.[0] || [];
  if (existing.length >= SHEET_HEADERS.length) return;
  // Write headers
  await googleApiRequest(
    `${SHEETS_BASE}/${sheetId}/values/A1:W1?valueInputOption=RAW`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ values: [SHEET_HEADERS] }),
    }
  );
}

export async function appendApplicationRow(
  id: string,
  formData: ApplicationFormData,
  folderUrl: string
): Promise<number> {
  const sheetId = getSheetId();
  await ensureHeaders();

  const row = buildRow(id, formData, folderUrl);

  const res = await googleApiRequest(
    `${SHEETS_BASE}/${sheetId}/values/A:W:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ values: [row] }),
    }
  );
  const json = await res.json();
  const updatedRange = json.updates?.updatedRange || "";
  const m = updatedRange.match(/\d+$/);
  return m ? parseInt(m[0], 10) : 0;
}

export interface SheetApplication {
  id: string; createdAt: string; status: string; fullName: string;
  motherName: string; nationalId: string; phone: string; province: string;
  city: string; address: string; dateOfBirth: string; maritalStatus: string;
  numChildren: string; emergencyContact: string; employmentType: string;
  employer: string; monthlySalary: string; loanPurpose: string;
  loanAmount: string; notes: string; folderUrl: string;
  statusNote: string; updatedAt: string; rowNumber: number;
}

export async function getAllApplications(): Promise<SheetApplication[]> {
  const sheetId = getSheetId();
  try {
    const res = await googleApiRequest(
      `${SHEETS_BASE}/${sheetId}/values/A2:W`
    );
    const json = await res.json();
    const rows: string[][] = json.values || [];
    return rows
      .map((row, i) => ({
        id: row[0] || "", createdAt: row[1] || "", status: row[2] || "",
        fullName: row[3] || "", motherName: row[4] || "", nationalId: row[5] || "",
        phone: row[6] || "", province: row[7] || "", city: row[8] || "",
        address: row[9] || "", dateOfBirth: row[10] || "", maritalStatus: row[11] || "",
        numChildren: row[12] || "", emergencyContact: row[13] || "",
        employmentType: row[14] || "", employer: row[15] || "",
        monthlySalary: row[16] || "", loanPurpose: row[17] || "",
        loanAmount: row[18] || "", notes: row[19] || "", folderUrl: row[20] || "",
        statusNote: row[21] || "", updatedAt: row[22] || "", rowNumber: i + 2,
      }))
      .filter((r) => r.id);
  } catch { return []; }
}

export async function getApplicationById(id: string): Promise<SheetApplication | null> {
  const all = await getAllApplications();
  return all.find((a) => a.id === id) || null;
}
