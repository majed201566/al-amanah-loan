import { NextRequest, NextResponse } from "next/server";
import { getAdminFromCookies } from "@/lib/admin/roles";
import { getAllApplications } from "@/lib/google/sheets";

export async function GET(_request: NextRequest) {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ success: false }, { status: 401 });

  try {
    const apps = await getAllApplications();
    const now = new Date();

    // ── Status breakdown ──
    const pending = apps.filter(a => a.status === "قيد الانتظار").length;
    const review = apps.filter(a => a.status === "قيد المراجعة").length;
    const approved = apps.filter(a => a.status === "موافق عليه").length;
    const rejected = apps.filter(a => a.status === "مرفوض").length;

    // ── Approval & rejection rates ──
    const decided = approved + rejected;
    const approvalRate = decided > 0 ? Math.round((approved / decided) * 100) : 0;
    const rejectionRate = decided > 0 ? Math.round((rejected / decided) * 100) : 0;

    // ── Daily applications (today) ──
    const todayStr = now.toISOString().slice(0, 10);
    const dailyCount = apps.filter(a => a.createdAt?.startsWith(todayStr)).length;

    // ── Monthly trend (last 12 months) ──
    const monthlyTrend: { month: string; count: number; approved: number; rejected: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleDateString("ar-IQ", { month: "short", year: "numeric" });
      const monthApps = apps.filter(a => {
        if (!a.createdAt) return false;
        const c = new Date(a.createdAt);
        return c.getMonth() === d.getMonth() && c.getFullYear() === d.getFullYear();
      });
      monthlyTrend.push({
        month: label,
        count: monthApps.length,
        approved: monthApps.filter(a => a.status === "موافق عليه").length,
        rejected: monthApps.filter(a => a.status === "مرفوض").length,
      });
    }

    // ── Province breakdown ──
    const byProvince: Record<string, { total: number; approved: number }> = {};
    apps.forEach(a => {
      if (!a.province) return;
      if (!byProvince[a.province]) byProvince[a.province] = { total: 0, approved: 0 };
      byProvince[a.province].total++;
      if (a.status === "موافق عليه") byProvince[a.province].approved++;
    });

    // ── Employment type distribution ──
    const byEmployment: Record<string, number> = {};
    apps.forEach(a => { if (a.employmentType) byEmployment[a.employmentType] = (byEmployment[a.employmentType] || 0) + 1; });

    // ── Loan purpose distribution ──
    const byPurpose: Record<string, number> = {};
    apps.forEach(a => { if (a.loanPurpose) byPurpose[a.loanPurpose] = (byPurpose[a.loanPurpose] || 0) + 1; });

    // ── Total amounts ──
    const totalRequested = apps.reduce((s, a) => s + (Number(a.loanAmount) || 0), 0);
    const totalApproved = apps.filter(a => a.status === "موافق عليه").reduce((s, a) => s + (Number(a.loanAmount) || 0), 0);

    // ── Average loan amount ──
    const avgLoan = apps.length > 0 ? Math.round(totalRequested / apps.length) : 0;

    // ── Processing time (avg days for approved apps) ──
    let totalDays = 0;
    let appsWithDays = 0;
    apps.filter(a => a.status === "موافق عليه" && a.createdAt).forEach(a => {
      const created = new Date(a.createdAt);
      const updated = a.updatedAt ? new Date(a.updatedAt) : new Date();
      const days = Math.round((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      if (days >= 0) { totalDays += days; appsWithDays++; }
    });
    const avgProcessingDays = appsWithDays > 0 ? Math.round(totalDays / appsWithDays) : 0;

    return NextResponse.json({
      success: true,
      data: {
        total: apps.length,
        pending, review, approved, rejected,
        approvalRate, rejectionRate,
        dailyCount,
        monthlyTrend,
        byProvince,
        byEmployment,
        byPurpose,
        totalRequested,
        totalApproved,
        avgLoan,
        avgProcessingDays,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: "تعذر جلب الإحصائيات" }, { status: 500 });
  }
}
