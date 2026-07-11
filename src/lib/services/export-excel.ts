/**
 * Excel export using exceljs.
 */

import ExcelJS from "exceljs";
import type { SheetApplication } from "@/lib/google/sheets";

export async function generateExcelBuffer(applications: SheetApplication[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "الأمانة للتمويل";
  // @ts-ignore — rightToLeft is valid at runtime
  workbook.views = [{ rightToLeft: true }];

  // @ts-ignore
  const ws = workbook.addWorksheet("الطلبات", { views: [{ rightToLeft: true }] });

  // Header style
  const headerStyle: Partial<ExcelJS.Style> = {
    font: { bold: true, color: { argb: "FFFFFFFF" }, size: 12 },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FF0A1628" } },
    alignment: { horizontal: "center", vertical: "middle" },
    border: { bottom: { style: "thin" } },
  };

  const headers = [
    "رقم الطلب", "تاريخ التقديم", "الحالة", "الاسم", "اسم الأم",
    "البطاقة الوطنية", "الهاتف", "المحافظة", "المدينة", "العنوان",
    "تاريخ الميلاد", "الحالة الاجتماعية", "الأطفال", "هاتف الطوارئ",
    "نوع الوظيفة", "جهة العمل", "الراتب", "الغرض", "المبلغ", "ملاحظات",
    "رابط Drive",
  ];

  // Add header row
  ws.columns = headers.map((h, i) => ({ header: h, key: `col${i}`, width: 18 }));
  ws.getRow(1).eachCell((cell) => { cell.style = headerStyle as any; });
  ws.getRow(1).height = 28;

  // Add data rows
  applications.forEach((app, idx) => {
    const row = [
      app.id, app.createdAt, app.status, app.fullName, app.motherName,
      app.nationalId, app.phone, app.province, app.city, app.address,
      app.dateOfBirth, app.maritalStatus, app.numChildren, app.emergencyContact,
      app.employmentType, app.employer, app.monthlySalary, app.loanPurpose,
      app.loanAmount, app.notes, app.folderUrl,
    ];
    const excelRow = ws.addRow(row);

    // Alternating row colors
    if (idx % 2 === 1) {
      excelRow.eachCell((cell) => {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8F5EE" } };
      });
    }

    // Status cell coloring
    const statusCell = excelRow.getCell(3);
    if (app.status === "موافق عليه") statusCell.font = { color: { argb: "FF059669" }, bold: true };
    else if (app.status === "مرفوض") statusCell.font = { color: { argb: "FFDC2626" }, bold: true };
    else if (app.status === "قيد المراجعة") statusCell.font = { color: { argb: "FF2563EB" }, bold: true };
  });

  // Summary sheet
  // @ts-ignore
  const summaryWs = workbook.addWorksheet("ملخص", { views: [{ rightToLeft: true }] });
  summaryWs.columns = [
    { header: "البيان", key: "label", width: 30 },
    { header: "القيمة", key: "value", width: 20 },
  ];
  summaryWs.getRow(1).eachCell((cell) => { cell.style = headerStyle as any; });

  const summaryData = [
    ["إجمالي الطلبات", applications.length],
    ["قيد الانتظار", applications.filter(a => a.status === "قيد الانتظار").length],
    ["قيد المراجعة", applications.filter(a => a.status === "قيد المراجعة").length],
    ["موافق عليه", applications.filter(a => a.status === "موافق عليه").length],
    ["مرفوض", applications.filter(a => a.status === "مرفوض").length],
    ["إجمالي المبالغ", applications.reduce((s, a) => s + (Number(a.loanAmount) || 0), 0).toLocaleString("en") + " د.ع"],
    ["تاريخ التصدير", new Date().toLocaleDateString("ar-IQ")],
  ];
  summaryData.forEach(d => summaryWs.addRow(d));

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
