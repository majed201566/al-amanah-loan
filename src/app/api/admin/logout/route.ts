import { NextRequest, NextResponse } from "next/server";
import { getAdminFromCookies } from "@/lib/admin/roles";
import { logAudit } from "@/lib/admin/audit-log";

export async function POST(request: NextRequest) {
  const admin = await getAdminFromCookies();
  if (admin) logAudit(admin.username, admin.role, "logout", "system", "تسجيل خروج");

  const response = NextResponse.json({ success: true });
  response.cookies.set("ad_session", "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}
