import { NextRequest, NextResponse } from "next/server";
import { getAdminFromCookies } from "@/lib/admin/roles";

export async function GET(_request: NextRequest) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ authenticated: false }, { status: 401 });
  return NextResponse.json({ authenticated: true, username: admin.username, role: admin.role, displayName: admin.displayName });
}
