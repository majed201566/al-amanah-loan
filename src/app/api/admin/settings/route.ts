import { NextRequest, NextResponse } from "next/server";
import { getAdminFromCookies, hasPermission } from "@/lib/admin/roles";
import { logAudit } from "@/lib/admin/audit-log";
import { getSettings, updateSettings } from "@/lib/services/settings";

export async function GET(_request: NextRequest) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ success: false }, { status: 401 });

  try {
    const settings = await getSettings();
    return NextResponse.json({ success: true, data: settings });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: "تعذر جلب الإعدادات" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ success: false }, { status: 401 });
  if (!hasPermission(admin.role, "export")) return NextResponse.json({ success: false, message: "غير مصرح" }, { status: 403 });

  try {
    const { updates } = await request.json();
    if (!updates || typeof updates !== "object") {
      return NextResponse.json({ success: false, message: "بيانات غير صالحة" }, { status: 400 });
    }

    await updateSettings(updates);
    const changed = Object.keys(updates).join("، ");
    logAudit(admin.username, admin.role, "settings_update", "settings", `تحديث: ${changed}`);

    const settings = await getSettings();
    return NextResponse.json({ success: true, message: "تم حفظ الإعدادات بنجاح", data: settings });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message || "فشل حفظ الإعدادات" }, { status: 500 });
  }
}
