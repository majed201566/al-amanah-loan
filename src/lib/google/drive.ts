/**
 * Google Drive via REST API.
 *
 * Creates applicant folders and uploads documents using multipart uploads.
 */

import { getDriveParentFolderId, googleApiRequest } from "./config";

const DRIVE_UPLOAD = "https://www.googleapis.com/upload/drive/v3/files";
const DRIVE_FILES = "https://www.googleapis.com/drive/v3/files";

export interface UploadedFile {
  name: string;
  driveId: string;
  webViewLink: string;
  mimeType: string;
}

// ── Create folder ──
export async function createApplicantFolder(
  applicantName: string,
  phone: string
): Promise<{ folderId: string; folderUrl: string }> {
  const folderName = `${applicantName} - ${phone}`;

  const metadata: any = {
    name: folderName,
    mimeType: "application/vnd.google-apps.folder",
  };

  const parentId = getDriveParentFolderId();
  if (parentId) metadata.parents = [parentId];

  const res = await googleApiRequest(`${DRIVE_FILES}?fields=id,webViewLink`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(metadata),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(`Drive folder creation failed: ${json.error?.message || res.status}`);

  return {
    folderId: json.id,
    folderUrl: `https://drive.google.com/drive/folders/${json.id}`,
  };
}

// ── Upload file (multipart) ──
export async function uploadFileToFolder(
  folderId: string,
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<UploadedFile> {
  // Build multipart body manually
  const metadata = JSON.stringify({
    name: fileName,
    parents: [folderId],
  });

  const boundary = `-------google_drive_boundary_${Date.now()}`;
  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n`),
    Buffer.from(`--${boundary}\r\nContent-Type: ${mimeType}\r\nContent-Transfer-Encoding: binary\r\n\r\n`),
    fileBuffer,
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ]);

  const res = await googleApiRequest(
    `${DRIVE_UPLOAD}?uploadType=multipart&fields=id,name,mimeType,webViewLink`,
    {
      method: "POST",
      headers: {
        "Content-Type": `multipart/related; boundary=${boundary}`,
        "Content-Length": String(body.length),
      },
      body,
    }
  );

  const json = await res.json();
  if (!res.ok) throw new Error(`File upload failed: ${json.error?.message || res.status}`);

  return {
    name: json.name || fileName,
    driveId: json.id,
    webViewLink: json.webViewLink || "",
    mimeType: json.mimeType || mimeType,
  };
}

// ── Generate clean filename ──
export function makeFileName(originalName: string, prefix: string): string {
  const ext = originalName.includes(".")
    ? originalName.substring(originalName.lastIndexOf("."))
    : "";
  const safePrefix = prefix.replace(/[^a-zA-Z0-9\u0600-\u06FF_\- ]/g, "_");
  return `${safePrefix}_${Date.now()}${ext}`;
}
