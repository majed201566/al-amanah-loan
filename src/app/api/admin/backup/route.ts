import { NextRequest, NextResponse } from "next/server";
import { getAdminFromCookies, hasPermission } from "@/lib/admin/roles";
import { logAudit } from "@/lib/admin/audit-log";
import { getAllApplications, SHEET_HEADERS, type SheetApplication } from "@/lib/google/sheets";
import { getSheetId, googleApiRequest } from "@/lib/google/config";

const SHEETS_BASE = "https://sheets.googleapis.com/v4/spreadsheets";

export async function POST(request: NextRequest) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ success: false }, { status: 401 });
  if (!hasPermission(admin.role, "export")) return NextResponse.json({ success: false, message: "غير مصرح" }, { status: 403 });

  try {
    const apps = await getAllApplications();
    const sheetId = getSheetId();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const backupSheetName = `نسخة_احتياطية_${timestamp}`;

    // Copy the main sheet to a backup tab
    const res = await googleApiRequest(
      `${SHEETS_BASE}/${sheetId}:batchUpdate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: [{
            duplicateSheet: {
              sourceSheetId: 0,
              newSheetName: backupSheetName,
            },
          }],
        }),
      }
    );

    const json = await res.json();
    if (!res.ok) throw new Error(json.error?.message || "فشل النسخ الاحتياطي");

    logAudit(admin.username, admin.role, "backup", "system", `نسخ احتياطي: ${backupSheetName} - ${apps.length} طلب`);

    return NextResponse.json({
      success: true,
      message: `تم إنشاء النسخة الاحتياطية بنجاح: ${backupSheetName}`,
      backupName: backupSheetName,
      applications: apps.length,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || "فشل النسخ الاحتياطي" }, { status: 500 });
  }
}
