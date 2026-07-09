import { NextRequest, NextResponse } from "next/server";
import { createAdminToken, sessionCookie, verifyAdminCredentials } from "@/lib/admin/roles";
import { logAudit } from "@/lib/admin/audit-log";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  // Rate limit: 5 attempts per minute per IP
  const ip = getClientIp(request);
  if (!checkRateLimit(`admin-login:${ip}`, 5, 60_000)) {
    return NextResponse.json(
      { success: false, message: "طلبات كثيرة جداً. يرجى المحاولة بعد دقيقة." },
      { status: 429 }
    );
  }

  try {
    const { username, password } = await request.json();
    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "يرجى إدخال اسم المستخدم وكلمة المرور" },
        { status: 400 }
      );
    }

    const admin = await verifyAdminCredentials(username, password);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "اسم المستخدم أو كلمة المرور غير صحيحة" },
        { status: 401 }
      );
    }

    const token = await createAdminToken(admin);

    const roleLabel =
      admin.role === "super_admin"
        ? "مدير عام"
        : admin.role === "admin"
        ? "مدير"
        : "مراجع";

    logAudit(admin.username, admin.role, "login", "system", `تسجيل دخول (${roleLabel})`, ip);

    const response = NextResponse.json({
      success: true,
      message: "تم تسجيل الدخول بنجاح",
      role: admin.role,
      displayName: admin.displayName,
    });

    const cookie = sessionCookie(token);
    response.cookies.set(cookie.name, cookie.value, {
      httpOnly: cookie.httpOnly,
      secure: cookie.secure,
      sameSite: cookie.sameSite as "lax" | "strict" | "none",
      path: cookie.path,
      maxAge: cookie.maxAge,
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, message: "حدث خطأ أثناء تسجيل الدخول" },
      { status: 500 }
    );
  }
}
