/**
 * Site settings — stored in a dedicated Google Sheet (or localStorage fallback).
 * Allows changing all site content from the admin panel without editing code.
 *
 * Settings Sheet columns:
 *   A: key   B: value   C: label_ar   D: type (text/image/richtext/json)
 */

import { getSheetId, googleApiRequest } from "@/lib/google/config";

const SHEETS_BASE = "https://sheets.googleapis.com/v4/spreadsheets";

// ── In-memory fallback (when Sheets is not configured) ──
let _memorySettings: Record<string, string> = {};

// ── Default settings ──
const DEFAULT_SETTINGS: Record<string, string> = {
  site_name: "الأمانة للتمويل",
  site_description: "حلول تمويلية متميزة تلبي احتياجاتك بأفضل الشروط وأسرع الإجراءات",
  logo_text: "الأمانة",
  logo_subtext: "للتمويل",
  contact_phone: "+964 780 123 4567",
  contact_email: "info@al-amanah.iq",
  contact_address: "شارع الكوفة، النجف الأشرف، العراق",
  working_hours: "الأحد - الخميس: 8:00 صباحاً - 4:00 مساءً",
  facebook_url: "#",
  twitter_url: "#",
  instagram_url: "#",
  linkedin_url: "#",
  hero_title: "تمويل سريع وموثوق لتحقيق أحلامك",
  hero_subtitle: "نقدم حلولاً تمويلية مبتكرة بأقل نسبة فائدة في العراق. وافق على طلبك خلال 24 ساعة.",
  hero_badge: "مرخصون من البنك المركزي العراقي",
  about_story_title: "أكثر من 15 عاماً من الثقة والتميز",
  about_story_text: "تأسست شركة الأمانة للتمويل في عام 2010 في مدينة النجف الأشرف...",
  loan_personal_title: "القرض الشخصي",
  loan_personal_desc: "تمويل شخصي يصل إلى 50 مليون دينار عراقي",
  loan_housing_title: "القرض العقاري",
  loan_housing_desc: "تملك منزل أحلامك بقرض عقاري يصل إلى 300 مليون دينار",
  loan_business_title: "قرض المشاريع",
  loan_business_desc: "دعم مشروعك التجاري بتمويل يصل إلى 200 مليون دينار",
  loan_car_title: "قرض السيارة",
  loan_car_desc: "اقتنِ سيارتك الجديدة بقرض يصل إلى 100 مليون دينار",
  cta_title: "هل أنت مستعد لتحقيق حلمك؟",
  cta_subtitle: "لا تتردد، فريقنا مستعد لمساعدتك. قدم طلبك الآن واحصل على الموافقة خلال 24 ساعة فقط.",
  footer_text: "© الأمانة للتمويل. جميع الحقوق محفوظة.",
  color_primary: "#C9A84C",
  color_secondary: "#0A1628",
  color_accent: "#F8F5EE",
};

// ── Try loading from Google Sheets ──
async function loadFromSheets(): Promise<Record<string, string> | null> {
  try {
    const sheetId = getSheetId();
    const res = await googleApiRequest(`${SHEETS_BASE}/${sheetId}/values/Settings!A2:D`);
    if (!res.ok) return null;
    const json = await res.json();
    const rows: string[][] = json.values || [];
    const settings: Record<string, string> = {};
    for (const row of rows) {
      if (row[0]) settings[row[0]] = row[1] || "";
    }
    return Object.keys(settings).length > 0 ? settings : null;
  } catch {
    return null;
  }
}

// ── Save to Google Sheets ──
async function saveToSheets(settings: Record<string, string>): Promise<void> {
  try {
    const sheetId = getSheetId();
    const rows = Object.entries(settings).map(([key, value]) => [key, value, "", ""]);
    // First clear
    await googleApiRequest(`${SHEETS_BASE}/${sheetId}/values/Settings!A2:D:clear`, { method: "POST" });
    // Then write headers + data
    await googleApiRequest(
      `${SHEETS_BASE}/${sheetId}/values/Settings!A1:D1?valueInputOption=RAW`,
      { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ values: [["المفتاح", "القيمة", "الوصف العربي", "النوع"]] }) }
    );
    if (rows.length > 0) {
      await googleApiRequest(
        `${SHEETS_BASE}/${sheetId}/values/Settings!A2:D?valueInputOption=RAW`,
        { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ values: rows }) }
      );
    }
  } catch {
    // Silently fallback to memory
  }
}

// ── Public API ──
export async function getSettings(): Promise<Record<string, string>> {
  const fromSheets = await loadFromSheets();
  if (fromSheets) {
    _memorySettings = fromSheets;
    return { ...DEFAULT_SETTINGS, ...fromSheets };
  }
  return { ...DEFAULT_SETTINGS, ..._memorySettings };
}

export async function getSetting(key: string): Promise<string> {
  const all = await getSettings();
  return all[key] || DEFAULT_SETTINGS[key] || "";
}

export async function updateSettings(updates: Record<string, string>): Promise<void> {
  const current = await getSettings();
  const merged = { ...current, ...updates };
  _memorySettings = { ..._memorySettings, ...updates };
  await saveToSheets(merged);
}

export async function resetSettings(): Promise<void> {
  _memorySettings = {};
  await saveToSheets(DEFAULT_SETTINGS);
}
