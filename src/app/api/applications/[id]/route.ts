/**
 * GET /api/applications/[id]
 *
 * Fetches a single application from Google Sheets.
 */

import { NextRequest, NextResponse } from "next/server";
import { getApplicationById } from "@/lib/google/sheets";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const app = await getApplicationById(id);
    if (!app) {
      return NextResponse.json(
        { success: false, message: "الطلب غير موجود" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: app });
  } catch (err: any) {
    console.error("GET /api/applications/[id] error:", err);
    return NextResponse.json(
      {
        success: false,
        message: "تعذر جلب بيانات الطلب. يرجى المحاولة مرة أخرى.",
      },
      { status: 500 }
    );
  }
}
