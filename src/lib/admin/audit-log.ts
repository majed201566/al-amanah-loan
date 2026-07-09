/**
 * Enhanced audit log — in-memory with periodic dump to Sheets.
 */

export type AdminAction =
  | "login" | "logout" | "approve" | "reject" | "review" | "edit" | "note" | "view"
  | "export_excel" | "export_pdf" | "backup" | "settings_update" | "admin_create" | "admin_delete";

export interface AuditEntry {
  id: string;
  admin: string;
  role: string;
  action: AdminAction;
  target: string;
  details: string;
  ip: string;
  timestamp: string;
}

const auditLog: AuditEntry[] = [];

export function logAudit(admin: string, role: string, action: AdminAction, target: string, details: string, ip = "127.0.0.1"): void {
  auditLog.push({
    id: `AUD-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    admin, role, action, target, details, ip,
    timestamp: new Date().toISOString(),
  });
  if (auditLog.length > 1000) auditLog.splice(0, auditLog.length - 1000);
}

export function getAuditLog(limit = 100, offset = 0): AuditEntry[] {
  return [...auditLog].reverse().slice(offset, offset + limit);
}

export function getAuditCount(): number {
  return auditLog.length;
}

export function getAuditByAction(action: AdminAction): AuditEntry[] {
  return [...auditLog].filter(e => e.action === action).reverse();
}

export function getAuditByAdmin(admin: string): AuditEntry[] {
  return [...auditLog].filter(e => e.admin === admin).reverse();
}
