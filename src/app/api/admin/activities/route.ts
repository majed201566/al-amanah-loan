import { NextRequest, NextResponse } from "next/server";
import { getAdminFromCookies } from "@/lib/admin/roles";
import { getAuditLog, getAuditCount } from "@/lib/admin/audit-log";

export async function GET(request: NextRequest) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ success: false }, { status: 401 });

  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get("limit") || "50");
  const offset = parseInt(url.searchParams.get("offset") || "0");

  return NextResponse.json({
    success: true,
    data: getAuditLog(limit, offset),
    total: getAuditCount(),
  });
}
