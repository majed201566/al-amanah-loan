import { NextRequest, NextResponse } from "next/server";
import { getAdminFromCookies, hasPermission, type AdminRole } from "@/lib/admin/roles";
import { logAudit } from "@/lib/admin/audit-log";
import { getApplicationById } from "@/lib/google/sheets";
import { getSheetId, googleApiRequest } from "@/lib/google/config";
import { sendApplicationStatusEmail } from "@/lib/services/email";
import { sendApplicationStatusSMS } from "@/lib/services/sms";

const SHEETS_BASE = "https://sheets.googleapis.com/v4/spreadsheets";

async function updateSheetCell(rowNumber: number, col: string, value: string): Promise<void> {
  const sheetId = getSheetId();
  await googleApiRequest(`${SHEETS_BASE}/${sheetId}/values/${col}${rowNumber}:${col}${rowNumber}?valueInputOption=RAW`, {
    method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ values: [[value]] }),
  });
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ success: false }, { status: 401 });
  const { id } = await params;
  try {
    const app = await getApplicationById(id);
    if (!app) return NextResponse.json({ success: false, message: "الطلب غير موجود" }, { status: 404 });
    logAudit(admin.username, admin.role, "view", id, "عرض تفاصيل الطلب");
    return NextResponse.json({ success: true, data: app });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: "خطأ في جلب الطلب" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ success: false }, { status: 401 });
  const { id } = await params;
  const body = await request.json();
  const { action, note, edits } = body;

  // Permission check
  if ((action === "approve" || action === "reject" || action === "review") && !hasPermission(admin.role, action)) {
    return NextResponse.json({ success: false, message: "غير مصرح بهذا الإجراء" }, { status: 403 });
  }
  if (action === "edit" && !hasPermission(admin.role, "edit_app")) {
    return NextResponse.json({ success: false, message: "غير مصرح بالتعديل" }, { status: 403 });
  }

  try {
    const app = await getApplicationById(id);
    if (!app) return NextResponse.json({ success: false, message: "الطلب غير موجود" }, { status: 404 });

    const now = new Date().toISOString();
    const row = app.rowNumber;
    let newStatus = app.status;

    if (action === "approve") {
      newStatus = "موافق عليه";
      await updateSheetCell(row, "C", newStatus);
      await updateSheetCell(row, "V", note || "تمت الموافقة على الطلب");
      await updateSheetCell(row, "W", now);
      logAudit(admin.username, admin.role, "approve", id, note || "موافقة على الطلب");
      // Notifications
      if (app.phone) sendApplicationStatusSMS(app.phone, app.fullName, id, newStatus);
      // Email if available (check notes for email)

    } else if (action === "reject") {
      newStatus = "مرفوض";
      await updateSheetCell(row, "C", newStatus);
      await updateSheetCell(row, "V", note || "نأسف، تم رفض الطلب");
      await updateSheetCell(row, "W", now);
      logAudit(admin.username, admin.role, "reject", id, note || "رفض الطلب");
      if (app.phone) sendApplicationStatusSMS(app.phone, app.fullName, id, newStatus);

    } else if (action === "review") {
      newStatus = "قيد المراجعة";
      await updateSheetCell(row, "C", newStatus);
      await updateSheetCell(row, "V", note || "تم تحويل الطلب للمراجعة");
      await updateSheetCell(row, "W", now);
      logAudit(admin.username, admin.role, "review", id, note || "تحويل للمراجعة");

    } else if (action === "note") {
      await updateSheetCell(row, "V", note || "");
      await updateSheetCell(row, "W", now);
      logAudit(admin.username, admin.role, "note", id, note || "إضافة ملاحظة");

    } else if (action === "edit" && edits) {
      const fieldMap: Record<string, { col: string }> = {
        fullName: { col: "D" }, motherName: { col: "E" }, nationalId: { col: "F" },
        phone: { col: "G" }, province: { col: "H" }, city: { col: "I" },
        address: { col: "J" }, dateOfBirth: { col: "K" }, maritalStatus: { col: "L" },
        numChildren: { col: "M" }, emergencyContact: { col: "N" }, employmentType: { col: "O" },
        employer: { col: "P" }, monthlySalary: { col: "Q" }, loanPurpose: { col: "R" },
        loanAmount: { col: "S" }, notes: { col: "T" },
      };
      for (const [key, value] of Object.entries(edits)) {
        const mapping = fieldMap[key];
        if (mapping && value !== undefined) await updateSheetCell(row, mapping.col, String(value));
      }
      await updateSheetCell(row, "W", now);
      logAudit(admin.username, admin.role, "edit", id, `تعديل: ${Object.keys(edits).join("، ")}`);
    }

    const updated = await getApplicationById(id);
    return NextResponse.json({ success: true, message: "تم التحديث بنجاح", data: updated });
  } catch (err: any) {
    console.error("Admin PUT error:", err);
    return NextResponse.json({ success: false, message: err.message || "فشل التحديث" }, { status: 500 });
  }
}
