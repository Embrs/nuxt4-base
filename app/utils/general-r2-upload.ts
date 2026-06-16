/**
 * R2 前端直傳工具
 *
 * 流程：① 向後端取 presigned PUT URL → ② 用 XHR 直接 PUT 到 R2（可顯示進度）→ ③ 回報 confirm。
 * 檔案 binary 全程不經過自家後端，後端只負責「發行行為、驗證、記帳」。
 *
 * ⚠️ 依賴後端端點 `/nuxt-api/base/upload/{presigned,confirm}`（目前為樣板規範，尚未建立）。
 *    後端端點實作與機制詳見 .claude/knowledge/r2-storage.md
 *
 * 此檔為前端純瀏覽器 API（fetch / XMLHttpRequest），無外部套件依賴，可獨立運作。
 * `$enum`、`StoreSelf` 由 Nuxt 自動導入，無需 import。
 */

interface GeneralR2UploadOptions {
  file: File;
  category: 'image' | 'video' | 'zip' | 'other';
  onProgress?: (progress: number) => void;
  relatedId?: number;
  relatedType?: string;
}

interface GeneralR2UploadResult {
  success: boolean;
  fileId?: number;
  url?: string;
  error?: string;
}

/** 通用 R2 直接上傳：① 取簽署 → ② XHR 直傳 R2（可顯示進度）→ ③ 回報 confirm */
export async function generalR2DirectUpload(options: GeneralR2UploadOptions): Promise<GeneralR2UploadResult> {
  const { file, category, onProgress, relatedId, relatedType } = options;
  const token = StoreSelf().apiToken;
  try {
    // ① 取得預簽署 URL
    const presignedRes = await fetch('/nuxt-api/base/upload/presigned', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ fileName: file.name, fileSize: file.size, mimeType: file.type, category })
    });
    const presignedJson = await presignedRes.json();
    if (presignedJson?.status?.code !== $enum.apiStatus.success) {
      throw new Error(presignedJson?.status?.message?.zh_tw || '取得上傳 URL 失敗');
    }
    const { uploadUrl, r2Key, uniqueFileName } = presignedJson.data;

    // ② 直接 PUT 到 R2（用 XHR 才能監聽進度）
    await uploadToR2WithProgress(uploadUrl, file, onProgress);

    // ③ 回報 confirm
    const confirmRes = await fetch('/nuxt-api/base/upload/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ r2Key, uniqueFileName, originalFileName: file.name, fileSize: file.size, mimeType: file.type, category, relatedId, relatedType })
    });
    const confirmJson = await confirmRes.json();
    if (confirmJson?.status?.code !== $enum.apiStatus.success) {
      throw new Error(confirmJson?.status?.message?.zh_tw || '確認上傳失敗');
    }
    const data = confirmJson.data;
    return { success: true, fileId: data?.id, url: data?.url };
  } catch (error: any) {
    return { success: false, error: error?.message || '上傳失敗' };
  }
}

/**
 * XHR PUT 直傳 R2，支援進度 / 逾時。
 * ⭐ Content-Type 必須與發簽署時帶的 mimeType 一致，否則 R2 簽章驗證失敗（403）。
 */
export function uploadToR2WithProgress(uploadUrl: string, file: File, onProgress?: (progress: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    });
    xhr.addEventListener('load', () => ((xhr.status >= 200 && xhr.status < 300) ? resolve() : reject(new Error(`R2 上傳失敗: HTTP ${xhr.status}`))));
    xhr.addEventListener('error', () => reject(new Error('R2 上傳失敗：網路錯誤')));
    xhr.addEventListener('timeout', () => reject(new Error('R2 上傳失敗：逾時')));
    xhr.timeout = 10 * 60 * 1000; // 10 分鐘，大檔請放寬
    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', file.type); // ⭐ 不可省略、不可改寫
    xhr.send(file);
  });
}
