/**
 * Email notification service (SMTP via nodemailer).
 * Configurable via admin settings or env vars.
 *
 * Env vars:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 */

import nodemailer from "nodemailer";

async function getTransporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER || "";
  const pass = process.env.SMTP_PASS || "";
  const from = process.env.SMTP_FROM || "noreply@al-amanah.iq";

  if (!user || !pass) return null;

  return { transporter: nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } }), from };
}

export async function sendApplicationStatusEmail(
  to: string,
  applicantName: string,
  applicationId: string,
  newStatus: string,
  note: string
): Promise<boolean> {
  const cfg = await getTransporter();
  if (!cfg) return false;

  const statusLabels: Record<string, string> = {
    "قيد الانتظار": "قيد الانتظار ⏳",
    "قيد المراجعة": "قيد المراجعة 🔍",
    "موافق عليه": "موافق عليه ✅",
    "مرفوض": "مرفوض ❌",
  };

  const subject = `تحديث حالة طلبكم رقم ${applicationId} - الأمانة للتمويل`;
  const html = `
    <div dir="rtl" style="font-family: Tahoma, sans-serif; max-width: 600px; margin: 0 auto; background: #fdf9f0; border-radius: 16px; padding: 32px; border: 1px solid #e6c87f;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #0a1628;">الأمانة للتمويل</h2>
      </div>
      <h3 style="color: #0a1628;">عزيزي/عزيزتي ${applicantName}،</h3>
      <p style="color: #1a3458; line-height: 1.8;">
        نود إعلامكم بأن حالة طلبكم رقم <strong>${applicationId}</strong> قد تغيرت إلى:
      </p>
      <div style="text-align: center; margin: 24px 0;">
        <span style="display: inline-block; background: linear-gradient(135deg, #c9a84c, #e6c87f); color: #0a1628; padding: 12px 32px; border-radius: 12px; font-size: 20px; font-weight: bold;">
          ${statusLabels[newStatus] || newStatus}
        </span>
      </div>
      ${note ? `<p style="color: #1a3458; line-height: 1.8; background: #fff; padding: 16px; border-radius: 12px; border-right: 4px solid #c9a84c;">${note}</p>` : ""}
      <p style="color: #6e8db2; margin-top: 24px;">
        يمكنكم متابعة طلبكم عبر موقعنا الإلكتروني أو الاتصال بنا على الرقم 0770 123 4567.
      </p>
      <hr style="border: none; border-top: 1px solid #e6c87f; margin: 24px 0;" />
      <p style="text-align: center; color: #9aafcb; font-size: 12px;">© ${new Date().getFullYear()} الأمانة للتمويل. جميع الحقوق محفوظة.</p>
    </div>
  `;

  try {
    await cfg.transporter.sendMail({ from: cfg.from, to, subject, html });
    return true;
  } catch { return false; }
}
