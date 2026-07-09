/**
 * PDF export using jspdf + jspdf-autotable.
 * Generates a RTL-formatted PDF report with application data.
 */

import { jsPDF } from "jspdf";
import type { SheetApplication } from "@/lib/google/sheets";

// Arabic character support helper
function reverseText(text: string): string {
  return text;
}

export async function generatePdfBuffer(applications: SheetApplication[], title = "تقرير طلبات التمويل"): Promise<Buffer> {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  // Page dimensions
  const pageWidth = doc.internal.pageSize.getWidth();

  // ── Title ──
  doc.setFontSize(18);
  doc.setTextColor(10, 22, 40);
  doc.text(title, pageWidth / 2, 15, { align: "center" });

  doc.setFontSize(10);
  doc.setTextColor(110, 141, 178);
  doc.text(`تاريخ التقرير: ${new Date().toLocaleDateString("ar-IQ")}`, pageWidth / 2, 22, { align: "center" });
  doc.text(`عدد الطلبات: ${applications.length}`, pageWidth / 2, 28, { align: "center" });

  // ── Stats Box ──
  const approved = applications.filter(a => a.status === "موافق عليه").length;
  const rejected = applications.filter(a => a.status === "مرفوض").length;
  const pending = applications.filter(a => a.status === "قيد الانتظار" || a.status === "قيد المراجعة").length;
  const totalAmount = applications.reduce((s, a) => s + (Number(a.loanAmount) || 0), 0);

  doc.setDrawColor(201, 168, 76);
  doc.setFillColor(253, 249, 240);
  doc.roundedRect(10, 33, pageWidth - 20, 18, 3, 3, "FD");

  doc.setFontSize(9);
  doc.setTextColor(10, 22, 40);
  const statsText = `✅ موافق: ${approved}    ❌ مرفوض: ${rejected}    ⏳ قيد المعالجة: ${pending}    💰 الإجمالي: ${totalAmount.toLocaleString("en")} د.ع`;
  doc.text(statsText, pageWidth / 2, 44, { align: "center" });

  // ── Table ──
  const headers = [["#", "رقم الطلب", "الاسم", "الهاتف", "المحافظة", "المبلغ", "الحالة", "التاريخ"]];

  const rows = applications.map((app, i) => [
    String(i + 1),
    app.id,
    app.fullName,
    app.phone,
    app.province,
    Number(app.loanAmount || 0).toLocaleString("en"),
    app.status,
    app.createdAt ? new Date(app.createdAt).toLocaleDateString("ar-IQ") : "—",
  ]);

  // @ts-ignore — jspdf-autotable types
  (doc as any).autoTable({
    startY: 55,
    head: headers,
    body: rows,
    styles: {
      fontSize: 8,
      cellPadding: 3,
      halign: "center",
      font: "helvetica",
    },
    headStyles: {
      fillColor: [10, 22, 40],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: [248, 245, 238],
    },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 30 },
      2: { cellWidth: 35 },
      3: { cellWidth: 28 },
      4: { cellWidth: 22 },
      5: { cellWidth: 28 },
      6: { cellWidth: 22 },
      7: { cellWidth: 22 },
    },
    didDrawPage: () => {
      // Footer
      doc.setFontSize(7);
      doc.setTextColor(158, 173, 203);
      doc.text(`© ${new Date().getFullYear()} الأمانة للتمويل - جميع الحقوق محفوظة`, pageWidth / 2, doc.internal.pageSize.getHeight() - 8, { align: "center" });
    },
  });

  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
  return pdfBuffer;
}
