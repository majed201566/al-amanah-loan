/**
 * Google Drive via REST API - OAuth 2.0 Version (Personal Drive)
 * 
 * Now uses OAuth 2.0 refresh token to upload directly to user's personal Drive
 * No more Service Account 0 quota issue - uses user's own Drive quota
 * Supports both My Drive and Shared Drives via supportsAllDrives=true
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

// ── Create folder in personal Drive ──
export async function createApplicantFolder(
  applicantName: string,
  phone: string
): Promise<{ folderId: string; folderUrl: string }> {
  const folderName = `${applicantName} - ${phone} - ${new Date().toISOString().split('T')[0]}`.substring(0, 100);
  const parentId = getDriveParentFolderId();

  console.log("========== [Drive OAuth] CREATE FOLDER START ==========");
  console.log(`[Drive OAuth] Folder Name: ${folderName}`);
  console.log(`[Drive OAuth] Parent Folder ID: ${parentId || "NONE (root of personal Drive)"}`);
  console.log(`[Drive OAuth] Applicant: ${applicantName}, Phone: ${phone}`);

  const metadata: any = {
    name: folderName,
    mimeType: "application/vnd.google-apps.folder",
  };
  if (parentId) metadata.parents = [parentId];

  const url = `${DRIVE_FILES}?fields=id,webViewLink,name,parents&supportsAllDrives=true`;
  console.log(`[Drive OAuth] Request URL: ${url}`);
  console.log(`[Drive OAuth] Metadata: ${JSON.stringify(metadata)}`);

  const res = await googleApiRequest(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(metadata),
  });

  console.log(`[Drive OAuth] Response Status: ${res.status} ${res.statusText}`);
  const json = await res.json();
  console.log(`[Drive OAuth] Full Response:`, JSON.stringify(json, null, 2));

  if (!res.ok) {
    console.log("========== CREATE FOLDER FAILED ==========");
    console.log(`HTTP: ${res.status}, code: ${json.error?.code}, message: ${json.error?.message}`);
    throw new Error(
      `Drive folder creation failed - HTTP ${res.status}, code=${json.error?.code}, message=${json.error?.message}, full=${JSON.stringify(json)}`
    );
  }

  console.log(`[Drive OAuth] Folder OK: ${json.id}, URL=${json.webViewLink}`);
  console.log("========== CREATE FOLDER SUCCESS ==========");

  return {
    folderId: json.id,
    folderUrl: json.webViewLink || `https://drive.google.com/drive/folders/${json.id}`,
  };
}

// ── Upload file to personal Drive ──
export async function uploadFileToFolder(
  folderId: string,
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<UploadedFile> {
  console.log("========== [Drive OAuth] UPLOAD START ==========");
  console.log(`[Drive OAuth] File: ${fileName}, Size: ${fileBuffer.length} bytes (${(fileBuffer.length / 1024).toFixed(2)} KB), MIME: ${mimeType}, Folder: ${folderId}`);

  if (!fileBuffer || fileBuffer.length === 0) {
    throw new Error(`File buffer empty: ${fileName}, folder=${folderId}`);
  }

  const metadata = JSON.stringify({
    name: fileName,
    parents: [folderId],
  });

  const boundary = `-------oauth_boundary_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  const bodyStart = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n`;
  const bodyMiddle = `--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`;
  const bodyEnd = `\r\n--${boundary}--\r\n`;
  const body = Buffer.concat([
    Buffer.from(bodyStart, 'utf-8'),
    Buffer.from(bodyMiddle, 'utf-8'),
    fileBuffer,
    Buffer.from(bodyEnd, 'utf-8'),
  ]);

  console.log(`[Drive OAuth] Boundary: ${boundary}, Body Length: ${body.length} bytes`);

  const url = `${DRIVE_UPLOAD}?uploadType=multipart&fields=id,name,mimeType,webViewLink,parents,size&supportsAllDrives=true`;
  console.log(`[Drive OAuth] Upload URL: ${url}`);

  try {
    const res = await googleApiRequest(url, {
      method: "POST",
      headers: { "Content-Type": `multipart/related; boundary=${boundary}` },
      body: body as any,
    });

    console.log(`[Drive OAuth] Response Status: ${res.status} ${res.statusText}`);
    const json = await res.json();
    console.log(`[Drive OAuth] Full Response:`, JSON.stringify(json, null, 2));
    console.log(`[Drive OAuth] error.code: ${json.error?.code}, error.message: ${json.error?.message}`);

    if (!res.ok) {
      console.log("========== UPLOAD FAILED ==========");
      console.log(`HTTP: ${res.status}, code: ${json.error?.code}, message: ${json.error?.message}, errors: ${JSON.stringify(json.error?.errors)}`);
      console.log(`Upload URL: ${url}, Parent: ${folderId}, MIME: ${mimeType}, Size: ${fileBuffer.length}, File: ${fileName}`);
      console.log("========== END FAILED ==========");

      throw new Error(
        `File upload failed: HTTP=${res.status}, code=${json.error?.code}, message=${json.error?.message}, errors=${JSON.stringify(json.error?.errors)}, status=${json.error?.status}, url=${url}, parent=${folderId}, mime=${mimeType}, size=${fileBuffer.length}, file=${fileName}, full=${JSON.stringify(json)}`
      );
    }

    console.log(`[Drive OAuth] Upload SUCCESS: ID=${json.id}, Link=${json.webViewLink}`);
    console.log("========== UPLOAD SUCCESS ==========");

    return {
      name: json.name || fileName,
      driveId: json.id,
      webViewLink: json.webViewLink || `https://drive.google.com/file/d/${json.id}/view`,
      mimeType: json.mimeType || mimeType,
    };
  } catch (err: any) {
    console.log("========== UPLOAD EXCEPTION ==========");
    console.log(`Exception: ${err.message}`);
    console.log(`Stack: ${err.stack}`);
    console.log(`File: ${fileName}, Parent: ${folderId}, MIME: ${mimeType}, Size: ${fileBuffer.length}`);
    console.log("========== END EXCEPTION ==========");
    if (err.message?.includes("File upload failed")) throw err;
    throw new Error(`Upload exception: file=${fileName}, parent=${folderId}, mime=${mimeType}, size=${fileBuffer.length}, error=${err.message}`);
  }
}

export function makeFileName(originalName: string, prefix: string): string {
  const ext = originalName.includes(".") ? originalName.substring(originalName.lastIndexOf(".")) : ".jpg";
  const safePrefix = prefix.replace(/[^a-zA-Z0-9\u0600-\u06FF_\- ]/g, "_").replace(/\s+/g, "_").substring(0, 80);
  const cleanExt = ext.toLowerCase();
  const finalExt = [".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif"].includes(cleanExt) ? cleanExt : ".jpg";
  return `${safePrefix}_${Date.now()}${finalExt}`;
}
