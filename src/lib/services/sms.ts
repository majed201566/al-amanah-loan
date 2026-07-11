/**
 * SMS notification service — ready for Iraqi SMS providers.
 *
 * Supported providers (set SMS_PROVIDER in .env.local):
 *
 *   "zaincash"   — ZainCash Business API (popular in Iraq)
 *   "zajil"      — Zajil SMS Gateway
 *   "hisms"      — Hisms.com API
 *   "custom"     — Generic REST API (set SMS_API_URL)
 *
 * Required env vars:
 *   SMS_PROVIDER=zaincash
 *   SMS_API_KEY=your_api_key
 *   SMS_SENDER_ID=AlAmanah      (optional, must be approved by provider)
 *   SMS_API_URL=https://...      (only for "custom" provider)
 */

// ── Config ──
interface SmsConfig {
  provider: string;
  apiKey: string;
  senderId: string;
  apiUrl?: string;
}

function getConfig(): SmsConfig | null {
  const provider = process.env.SMS_PROVIDER || "";
  const apiKey = process.env.SMS_API_KEY || "";
  if (!provider || !apiKey) return null;
  return {
    provider,
    apiKey,
    senderId: process.env.SMS_SENDER_ID || "AlAmanah",
    apiUrl: process.env.SMS_API_URL || undefined,
  };
}

// ── Send single SMS ──
export async function sendSMS(phone: string, message: string): Promise<boolean> {
  const cfg = getConfig();
  if (!cfg) {
    // Not configured — log for debugging, don't fail
    console.log(`[SMS] Not configured. Would send to ${phone}: ${message.slice(0, 60)}...`);
    return false;
  }

  try {
    switch (cfg.provider) {
      case "zaincash":
        return sendZainCash(cfg, phone, message);
      case "zajil":
        return sendZajil(cfg, phone, message);
      case "hisms":
        return sendHisms(cfg, phone, message);
      case "custom":
        return sendCustom(cfg, phone, message);
      default:
        console.log(`[SMS] Unknown provider: ${cfg.provider}`);
        return false;
    }
  } catch (err: any) {
    console.error(`[SMS] Failed to send to ${phone}:`, err.message);
    return false;
  }
}

// ── Provider implementations ──

async function sendZainCash(cfg: SmsConfig, phone: string, message: string): Promise<boolean> {
  // ZainCash business SMS API
  // Documentation: https://zaincash.iq/business
  const res = await fetch("https://api.zaincash.iq/v1/sms/send", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${cfg.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: phone.replace(/^\+964/, ""),
      message,
      sender: cfg.senderId,
    }),
  });
  return res.ok;
}

async function sendZajil(cfg: SmsConfig, phone: string, message: string): Promise<boolean> {
  // Zajil SMS Gateway
  // Documentation: https://zajil.com/api
  const res = await fetch("https://api.zajil.com/send", {
    method: "POST",
    headers: {
      "X-API-Key": cfg.apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      number: phone,
      message,
      sender: cfg.senderId,
    }),
  });
  return res.ok;
}

async function sendHisms(cfg: SmsConfig, phone: string, message: string): Promise<boolean> {
  // Hisms.com SMS API
  const res = await fetch("https://hisms.com/api/send", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${cfg.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      mobile: phone,
      text: message,
      sender: cfg.senderId,
    }),
  });
  return res.ok;
}

async function sendCustom(cfg: SmsConfig, phone: string, message: string): Promise<boolean> {
  if (!cfg.apiUrl) {
    console.error("[SMS] Custom provider needs SMS_API_URL");
    return false;
  }
  const res = await fetch(cfg.apiUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${cfg.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ to: phone, message, sender: cfg.senderId }),
  });
  return res.ok;
}

// ── Application status notification ──
export async function sendApplicationStatusSMS(
  phone: string,
  applicantName: string,
  applicationId: string,
  newStatus: string
): Promise<boolean> {
  const labels: Record<string, string> = {
    "قيد الانتظار": "قيد الانتظار ⏳",
    "قيد المراجعة": "قيد المراجعة 🔍",
    "موافق عليه": "تمت الموافقة ✅",
    "مرفوض": "تم رفضه ❌",
  };

  const message = [
    `عزيزي/عزيزتي ${applicantName}،`,
    `حالة طلبكم رقم ${applicationId}: ${labels[newStatus] || newStatus}`,
    `لمزيد من المعلومات يرجى زيارة موقعنا.`,
    `شركة الأمانة للتمويل`,
  ].join("\n");

  return sendSMS(phone, message);
}
