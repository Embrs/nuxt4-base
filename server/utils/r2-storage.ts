/**
 * Cloudflare R2 物件儲存工具
 *
 * 提供檔案上傳、下載、刪除、預簽署 URL、存在檢查、大小驗證、key 產生等能力。
 * 設計為「可直接複製到任何 Nuxt / Node.js 專案」的可攜模組，僅依賴 @aws-sdk，
 * 不依賴本專案其他後端工具，方便日後啟用後端時直接套用。
 *
 * ⚠️ 啟用前置：本檔依賴尚未安裝的後端套件，請先執行：
 *     npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
 *   未安裝前此檔的 import 無法解析；由於目前無任何路由引用本檔，不影響 dev / build。
 *
 * 機制與端點用法詳見 .claude/knowledge/r2-storage.md
 */
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  HeadObjectCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { Readable } from 'node:stream';

// === 檔案大小限制（從環境變數讀取，單位 MB）===
const MAX_ZIP_SIZE_MB = parseInt(process.env.MAX_ZIP_SIZE_MB || '1024');
const MAX_IMAGE_SIZE_MB = parseInt(process.env.MAX_IMAGE_SIZE_MB || '20');
const MAX_VIDEO_SIZE_MB = parseInt(process.env.MAX_VIDEO_SIZE_MB || '100');
const MAX_OTHER_SIZE_MB = parseInt(process.env.MAX_OTHER_SIZE_MB || '1024');

// === R2 客戶端（單例）===
const isR2Enabled = () =>
  !!(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_BUCKET_NAME);

let r2Client: S3Client | null = null;

export function getR2Client(): S3Client {
  if (!isR2Enabled()) {
    throw new Error('R2 未設定：請設定 R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME');
  }
  if (!r2Client) {
    const accountId = process.env.R2_ACCOUNT_ID!;
    r2Client = new S3Client({
      region: 'auto', // ⭐ R2 固定用 'auto'，不可填真實 AWS region
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`, // ⭐ 由 accountId 組成，不含 bucket 名
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!
      }
    });
  }
  return r2Client;
}

/** 後端直接上傳（Buffer / Stream）。一般情境採「前端預簽署直傳」；此函式用於後端產生的檔案（PDF、備份等） */
export async function uploadToR2(key: string, data: Buffer | Readable, contentType: string, metadata?: Record<string, string>): Promise<string> {
  const client = getR2Client();
  await client.send(new PutObjectCommand({ Bucket: process.env.R2_BUCKET_NAME!, Key: key, Body: data, ContentType: contentType, Metadata: metadata }));
  return key;
}

/**
 * 取得下載用 signed URL。
 * 傳入 downloadFileName 會加上 response-content-disposition=attachment，強制瀏覽器下載而非 inline 預覽。
 * （跨來源時前端 <a download> 屬性會被忽略，必須靠 server-side disposition；單純預覽請用不帶此參數的 URL）
 */
export async function getR2SignedUrl(key: string, expiresIn: number = 3600, downloadFileName?: string): Promise<string> {
  const client = getR2Client();
  return getSignedUrl(client, new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    ...(downloadFileName ? { ResponseContentDisposition: `attachment; filename="${encodeURIComponent(downloadFileName)}"` } : {})
  }), { expiresIn });
}

/** 取得上傳用 presigned PUT URL（前端直傳用） */
export async function getR2PresignedUploadUrl(key: string, contentType: string, expiresIn: number = 3600): Promise<string> {
  const client = getR2Client();
  return getSignedUrl(client, new PutObjectCommand({ Bucket: process.env.R2_BUCKET_NAME!, Key: key, ContentType: contentType }), { expiresIn });
}

/** 讀取檔案內容為 Buffer（小檔用；大檔請用 downloadFromR2 串流） */
export async function getR2Object(key: string): Promise<Buffer> {
  const client = getR2Client();
  const response = await client.send(new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME!, Key: key }));
  if (!response.Body) throw new Error(`R2 檔案內容為空: ${key}`);
  const chunks: Uint8Array[] = [];
  for await (const chunk of response.Body as any) chunks.push(chunk);
  return Buffer.concat(chunks);
}

/** 串流下載至本地路徑（大檔友善，避免整檔讀進記憶體；用 pipeline 自動處理背壓與錯誤傳遞） */
export async function downloadFromR2(key: string, destPath: string): Promise<void> {
  const { createWriteStream, mkdirSync } = await import('node:fs');
  const { dirname } = await import('node:path');
  const { pipeline } = await import('node:stream/promises');
  const client = getR2Client();
  const response = await client.send(new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME!, Key: key }));
  if (!response.Body) throw new Error(`R2 檔案內容為空: ${key}`);
  mkdirSync(dirname(destPath), { recursive: true });
  await pipeline(response.Body as Readable, createWriteStream(destPath));
}

/** 刪除單檔（失敗回 false，不丟例外） */
export async function deleteFromR2(key: string): Promise<boolean> {
  try {
    await getR2Client().send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET_NAME!, Key: key }));
    return true;
  } catch (error) {
    console.error(`✗ R2 刪除失敗: ${key}`, error);
    return false;
  }
}

/** 批次刪除（每批最多 1000 件，S3 / R2 硬上限）。回傳成功與失敗清單 */
export async function deleteManyFromR2(
  keys: string[],
  options?: { onBatchDone?: (deletedCount: number) => void | Promise<void> }
): Promise<{ deleted: string[]; errors: Array<{ key: string; message: string }> }> {
  if (keys.length === 0) return { deleted: [], errors: [] };
  const client = getR2Client();
  const bucket = process.env.R2_BUCKET_NAME!;
  const BATCH_SIZE = 1000;
  const deleted: string[] = [];
  const errors: Array<{ key: string; message: string }> = [];
  for (let i = 0; i < keys.length; i += BATCH_SIZE) {
    const batch = keys.slice(i, i + BATCH_SIZE);
    try {
      const response = await client.send(new DeleteObjectsCommand({ Bucket: bucket, Delete: { Objects: batch.map((Key) => ({ Key })), Quiet: false } }));
      for (const item of response.Deleted || []) if (item.Key) deleted.push(item.Key);
      for (const err of response.Errors || []) if (err.Key) errors.push({ key: err.Key, message: err.Message || err.Code || 'Unknown' });
    } catch (error: any) {
      for (const key of batch) errors.push({ key, message: error?.message || 'Batch delete failed' });
    }
    if (options?.onBatchDone) await options.onBatchDone(deleted.length);
  }
  return { deleted, errors };
}

/** 檢查檔案是否存在（confirm 步驟必用） */
export async function checkR2FileExists(key: string): Promise<boolean> {
  try {
    await getR2Client().send(new HeadObjectCommand({ Bucket: process.env.R2_BUCKET_NAME!, Key: key }));
    return true;
  } catch (error: any) {
    if (error.name === 'NotFound') return false;
    throw error;
  }
}

/** 取得檔案 metadata（不存在回 null） */
export async function getR2FileInfo(key: string): Promise<{ contentType: string; contentLength: number; lastModified: Date } | null> {
  try {
    const r = await getR2Client().send(new HeadObjectCommand({ Bucket: process.env.R2_BUCKET_NAME!, Key: key }));
    return { contentType: r.ContentType || 'application/octet-stream', contentLength: r.ContentLength || 0, lastModified: r.LastModified || new Date() };
  } catch (error: any) {
    if (error.name === 'NotFound') return null;
    throw error;
  }
}

export function isR2Available(): boolean {
  return isR2Enabled();
}

/** 依副檔名 / MIME 判斷大小是否超過上限 */
export function validateFileSize(fileSize: number, contentType: string, fileName: string): { valid: boolean; maxSize: number; actualSize: number; message: string } {
  const fileSizeMB = fileSize / (1024 * 1024);
  let maxSizeMB: number;
  let fileType: string;
  if (fileName.toLowerCase().endsWith('.zip') || contentType === 'application/zip') { maxSizeMB = MAX_ZIP_SIZE_MB; fileType = 'ZIP'; }
  else if (contentType.startsWith('image/')) { maxSizeMB = MAX_IMAGE_SIZE_MB; fileType = '圖片'; }
  else if (contentType.startsWith('video/')) { maxSizeMB = MAX_VIDEO_SIZE_MB; fileType = '影片'; }
  else { maxSizeMB = MAX_OTHER_SIZE_MB; fileType = '一般'; }
  const valid = fileSizeMB <= maxSizeMB;
  return {
    valid,
    maxSize: maxSizeMB,
    actualSize: parseFloat(fileSizeMB.toFixed(2)),
    message: valid
      ? `${fileType}檔案 ${fileSizeMB.toFixed(2)}MB 符合限制 ${maxSizeMB}MB`
      : `${fileType}檔案 ${fileSizeMB.toFixed(2)}MB 超過限制 ${maxSizeMB}MB`
  };
}

/** 產生 R2 key：category/YYYY/MM/filename */
export function generateR2Key(category: string, fileName: string): string {
  const now = new Date();
  return `${category}/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${fileName}`;
}
