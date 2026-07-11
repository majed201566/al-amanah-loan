import { NextRequest, NextResponse } from "next/server";
import { getAdminFromCookies } from "@/lib/admin/roles";
import { logAudit } from "@/lib/admin/audit-log";
import { getAllApplications } from "@/lib/google/sheets";
import { generateExcelBuffer } from "@/lib/services/export-excel";

export async function GET(request: NextRequest) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ success: false }, { status: 401 });

  try {
    const apps = await getAllApplications();
    const buffer = await generateExcelBuffer(apps);
    logAudit(admin.username, admin.role, "export_excel", "all", `تصدير ${apps.length} طلب إلى Excel`);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="تقرير_الطلبات_${new Date().toISOString().slice(0, 10)}.xlsx"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || "فشل التصدير" }, { status: 500 });
  }
}
