# Cloudflare R2 檔案儲存

> [!NOTE]
> **混合級別**：環境變數與下列兩支「實際檔案」已落地可用，**後端端點（§5）為樣板規範**。
> 目前專案為前端快速樣板，`server/routes`、Prisma、JWT、`@@/utils/response` 尚未建立，
> §5 的端點與 DB 模型請於初始化後端後再實際建立。
>
> 已落地（實際檔案）：
> - [server/utils/r2-storage.ts](../../server/utils/r2-storage.ts) — R2 核心工具（**需先 `npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner`**，未裝前 import 無法解析，但因無路由引用故不影響 dev / build）
> - [app/utils/general-r2-upload.ts](../../app/utils/general-r2-upload.ts) — 前端直傳工具（純瀏覽器 API，無外部依賴）
> - `.env.example` / `.env` 已含 R2 變數區塊（註解狀態）

本文整理自其他專案收斂的 R2 實戰實作，抽象為跨專案可攜的標準做法。新落地順序：**§3 前置設定 → §4 核心工具 → §5 後端 API → §6 前端直傳**，並務必看完 §10 注意事項與 §11 落地 Checklist。

---

## 1. 為什麼用 R2

- **S3 API 相容**：直接用 `@aws-sdk/client-s3`，未來可平移到任何 S3 相容服務。
- **零流量費（egress free）**：R2 下載不收流量費，適合大量圖片 / 影片 / 大檔（ZIP、DICOM、備份）。
- **預簽署直傳**：檔案由瀏覽器**直接 PUT 到 R2**，不經自家伺服器，省頻寬、省記憶體、可傳大檔。

## 2. 核心架構：預簽署直傳三步驟

這是整套做法的關鍵。**不要讓檔案 binary 流經自家後端**，後端只負責「發行行為、驗證、記帳」：

```
┌─────────┐   ① 要上傳憑證     ┌──────────┐
│ 前端     │ ───────────────▶ │ 後端 API  │  發 presigned PUT URL（有效 1hr）
│ Browser │ ◀─────────────── │ (Nitro)  │
│         │   uploadUrl       └──────────┘
│         │
│         │   ② PUT 檔案 binary（XHR 可顯示進度）
│         │ ──────────────────────────────────▶ ┌─────────┐
│         │ ◀────────────────────────────────── │   R2    │
│         │                                      └─────────┘
│         │   ③ 回報「傳好了」    ┌──────────┐
│         │ ──────────────────▶ │ 後端 API  │  驗證 R2 真有檔 → 寫 DB 記錄
└─────────┘ ◀────────────────── └──────────┘   回傳 fileId / url
```

**關鍵**：第 ③ 步後端必須用 `HeadObject` 確認檔案真的存在於 R2 才寫 DB，避免前端只拿憑證沒傳卻產生孤兒記錄。

---

## 3. 前置設定

### 3.1 安裝套件

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

> 兩個版本通常一致（本系列驗證於 `^3.930.0`）。本專案目前**刻意尚未安裝**，啟用後端時再裝。

### 3.2 環境變數

本專案已在 `.env.example` 與 `.env` 加入以下區塊（註解狀態）。啟用時取消註解並填值：

```env
# === Cloudflare R2 ===
R2_ACCOUNT_ID=             # Cloudflare 帳戶 ID（組成 endpoint）
R2_ACCESS_KEY_ID=          # R2 API Token 的 Access Key ID
R2_SECRET_ACCESS_KEY=      # R2 API Token 的 Secret（機密；絕不進 repo / 前端）
R2_BUCKET_NAME=            # Bucket 名稱，例：myapp-prod

# === 檔案大小上限（MB，選填，留空走預設）===
MAX_ZIP_SIZE_MB=1024
MAX_IMAGE_SIZE_MB=20
MAX_VIDEO_SIZE_MB=100
MAX_OTHER_SIZE_MB=1024
```

- `endpoint` 由 `R2_ACCOUNT_ID` 自動組成 `https://<accountId>.r2.cloudflarestorage.com`，**不需另外設環境變數**。
- 機密值（`R2_SECRET_ACCESS_KEY`）只放後端，**永遠不可**出現在前端 bundle 或 git。`.env.example` 為唯一版控的 env 檔（見 `.gitignore` 的 `!.env.example`），只可留鍵名、不留值；真實值只放本機 `.env`（已被忽略）。
- 本工具刻意用 `process.env.*` 直讀（可攜、符合標準 R2 命名），未走 `nuxt.config.ts` 的 `runtimeConfig`。若要改走 runtimeConfig，需把鍵改為 `NUXT_R2_*` 命名並調整 `r2-storage.ts`。

### 3.3 建立 Bucket 與 API Token（Cloudflare Dashboard）

1. R2 → Create bucket（名稱填 `R2_BUCKET_NAME`）。
2. R2 → Manage R2 API Tokens → Create，權限選 **Object Read & Write**，限定該 bucket。
3. 取得 Access Key ID / Secret 填入環境變數。

### 3.4 ⭐ CORS 設定（最常見的踩雷點）

因為瀏覽器要**直接 PUT 到 R2**，必須在 bucket 設 CORS，否則第 ② 步會被瀏覽器擋下。
Cloudflare Dashboard → 該 bucket → Settings → CORS Policy：

```json
[
  {
    "AllowedOrigins": ["https://your-domain.com", "http://localhost:3000"],
    "AllowedMethods": ["GET", "PUT"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

- `AllowedOrigins` 要含**所有**前端來源（正式站、測試站、本機 dev port；本專案 dev 為 `3000`）。
- `AllowedMethods` 至少要有 `PUT`（上傳）與 `GET`（若前端要直接讀 signed URL）。

---

## 4. 核心工具：[server/utils/r2-storage.ts](../../server/utils/r2-storage.ts)

已建為實際檔案，可直接複製到任何專案。對外提供：

| 函式 | 用途 |
|------|------|
| `getR2Client()` | 取得 S3Client 單例（`region: 'auto'`、endpoint 由 accountId 組成） |
| `uploadToR2(key, data, contentType, metadata?)` | 後端直接上傳 Buffer / Stream（後端產生的檔案用） |
| `getR2SignedUrl(key, expiresIn?, downloadFileName?)` | 取下載用 signed URL；帶 `downloadFileName` 會強制 attachment 下載 |
| `getR2PresignedUploadUrl(key, contentType, expiresIn?)` | 取上傳用 presigned PUT URL（前端直傳用） |
| `getR2Object(key)` | 讀整檔為 Buffer（小檔用） |
| `downloadFromR2(key, destPath)` | 串流下載至本地路徑（大檔友善） |
| `deleteFromR2(key)` | 刪單檔（失敗回 false，不丟例外） |
| `deleteManyFromR2(keys, options?)` | 批次刪除（每批 ≤1000 件，自動分批） |
| `checkR2FileExists(key)` | 檢查檔案存在（**confirm 步驟必用**） |
| `getR2FileInfo(key)` | 取 metadata（不存在回 null） |
| `isR2Available()` | 環境變數是否齊全 |
| `validateFileSize(fileSize, contentType, fileName)` | 依副檔名 / MIME 驗大小上限 |
| `generateR2Key(category, fileName)` | 產生 `category/YYYY/MM/filename` key |

---

## 5. 後端 API（樣板規範，啟用後端後建立）

> 以下端點依本專案後端規範（見 [backend-conventions.md](backend-conventions.md)）撰寫：**以 `return` 回傳錯誤、禁止 `throw`**，
> 使用 `@@/utils/response` 的 `successResponse` / `badRequestError` / `forbiddenError` / `notFoundError`，錯誤訊息三語系。
> 依賴的 `@@/utils/jwt`（`getUserFromToken`）、`@@/utils/response`、`@@/utils/prisma` 與 `UploadFile` 模型均屬待建後端基礎設施。
> 下列 `*Error` / `successResponse` 簽名為示意，實際以 `@@/utils/response` 實作為準。

### 5.1 發預簽署上傳 URL — `POST /nuxt-api/base/upload/presigned`

職責：驗身分 → 驗參數 → 驗大小 → 產生**唯一檔名**與 key → 發 presigned URL。

```typescript
import { getUserFromToken } from '@@/utils/jwt';
import { successResponse, badRequestError, forbiddenError } from '@@/utils/response';
import { generateR2Key, getR2PresignedUploadUrl, validateFileSize } from '@@/utils/r2-storage';
import { randomUUID } from 'node:crypto';
import path from 'node:path';

export default defineEventHandler(async (event) => {
  const userInfo = getUserFromToken(event);
  if (!userInfo) return forbiddenError({ zh_tw: '未授權', en: 'Unauthorized', ja: '未承認' });

  const { fileName, fileSize, mimeType, category } = await readBody(event);
  if (!fileName || !fileSize || !mimeType || !category)
    return badRequestError({ zh_tw: '缺少必要參數', en: 'Missing required parameters', ja: '必須パラメータがありません' });

  if (!['image', 'video', 'zip', 'other'].includes(category))
    return badRequestError({ zh_tw: '無效的檔案類別', en: 'Invalid file category', ja: '無効なファイルカテゴリです' });

  const validation = validateFileSize(fileSize, mimeType, fileName);
  if (!validation.valid)
    return badRequestError({
      zh_tw: `檔案過大（${validation.actualSize}MB 超過 ${validation.maxSize}MB）`,
      en: `File too large (${validation.actualSize}MB exceeds ${validation.maxSize}MB)`,
      ja: `ファイルが大きすぎます（${validation.actualSize}MB / 上限 ${validation.maxSize}MB）`
    });

  // ⭐ 產生唯一檔名：timestamp_uuid_淨化後原檔名.ext（避免覆蓋、避免特殊字元 / 中文造成 key 問題）
  const ext = path.extname(fileName).toLowerCase();
  const baseName = path.basename(fileName, ext).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);
  const uniqueFileName = `${Date.now()}_${randomUUID()}_${baseName}${ext}`;
  const r2Key = generateR2Key(category, uniqueFileName);

  const uploadUrl = await getR2PresignedUploadUrl(r2Key, mimeType, 3600); // 1 小時
  return successResponse({ uploadUrl, r2Key, uniqueFileName, expiresIn: 3600 });
});
```

### 5.2 確認上傳 — `POST /nuxt-api/base/upload/confirm`

職責：驗身分 → **`HeadObject` 確認 R2 真有檔** → 寫 DB 記錄（`fileName` 存完整 R2 key）→ 回 `fileId` / `url`。

```typescript
import { getUserFromToken } from '@@/utils/jwt';
import { successResponse, badRequestError, forbiddenError } from '@@/utils/response';
import { prisma } from '@@/utils/prisma';
import { checkR2FileExists } from '@@/utils/r2-storage';

export default defineEventHandler(async (event) => {
  const userInfo = getUserFromToken(event);
  if (!userInfo) return forbiddenError({ zh_tw: '未授權', en: 'Unauthorized', ja: '未承認' });

  const { r2Key, uniqueFileName, originalFileName, fileSize, mimeType, category, relatedId, relatedType } = await readBody(event);
  if (!r2Key || !uniqueFileName || !originalFileName || !fileSize || !mimeType || !category)
    return badRequestError({ zh_tw: '缺少必要參數', en: 'Missing required parameters', ja: '必須パラメータがありません' });

  // ⭐ 必做：確認檔案真上傳到 R2 了才寫 DB（否則前端拿了憑證沒傳，會產生孤兒記錄）
  if (!(await checkR2FileExists(r2Key)))
    return badRequestError({ zh_tw: '檔案上傳未完成', en: 'File upload not completed', ja: 'ファイルのアップロードが完了していません' });

  const fileRecord = await prisma.uploadFile.create({
    data: {
      originalName: originalFileName,
      fileName: r2Key, // ⭐ 存完整 R2 key，例：image/2025/11/xxx.jpg
      fileSize: Number(fileSize),
      mimeType,
      category,
      uploadedBy: userInfo.userId,
      relatedType: relatedType || null,
      relatedId: relatedId ? Number(relatedId) : null
    }
  });
  return successResponse({ id: fileRecord.id, url: `/files/${fileRecord.id}`, fileName: uniqueFileName, originalName: originalFileName, fileSize, mimeType });
});
```

### 5.3 檔案存取 — `GET /files/:fileId`

職責：用 DB 記錄找 R2 key → 簽 signed URL → **HTTP 302 跳轉**讓瀏覽器直接向 R2 拿檔（零流量成本）。

> 此為公開 passthrough 端點，非 `/nuxt-api/*` JSON 端點，故以 HTTP 狀態碼 / `sendRedirect` 回應，不套用 JSON envelope；錯誤用 `setResponseStatus` + `return` 取代 `throw`。

```typescript
import { isR2Available, checkR2FileExists, getR2SignedUrl } from '@@/utils/r2-storage';

export default defineEventHandler(async (event) => {
  const fileId = Number(event.context.params?.fileId);
  if (!fileId || isNaN(fileId)) { setResponseStatus(event, 400); return 'Invalid file ID'; }

  const fileRecord = await getFileRecord(fileId); // 由 DB 取記錄（自行實作）
  if (!fileRecord) { setResponseStatus(event, 404); return 'File not found'; }

  // （可選）業務權限 / 軟刪除檢查：已刪除回 410 Gone

  if (isR2Available()) {
    try {
      if (await checkR2FileExists(fileRecord.fileName)) {
        const signedUrl = await getR2SignedUrl(fileRecord.fileName, 3600);
        return sendRedirect(event, signedUrl, 302); // ⭐ 跳轉，不要 proxy
      }
    } catch (error) {
      console.warn(`⚠️ R2 檢查失敗，改回本地: ${fileRecord.fileName}`, error);
    }
  }
  // 改回本地檔案（R2 未啟用時）— 視專案需要保留
  setResponseStatus(event, 404);
  return 'File not found';
});
```

> 對外發布的 `/files/:id` 是穩定的對外網址（可直接放進 `<img src>` / DB）；signed URL 的 1hr 有效期由 302 每次重新簽發吸收，呼叫端不需管理。

### 5.4 DB 檔案記錄表（Prisma 模型樣板）

```prisma
model UploadFile {
  id           Int      @id @default(autoincrement())
  originalName String                       // 原始檔名
  fileName     String                       // = R2 key，例：image/2025/11/xxx.jpg
  fileSize     Int
  mimeType     String
  category     String                       // image / video / zip / other
  uploadedBy   Int                          // 上傳者 userId
  relatedType  String?                      // 關聯業務類型（選填）
  relatedId    Int?                         // 關聯業務 ID（選填）
  createdAt    DateTime @default(now())
}
```

---

## 6. 前端直傳工具：[app/utils/general-r2-upload.ts](../../app/utils/general-r2-upload.ts)

已建為實際檔案（自動導入、無外部依賴）。對外提供 `generalR2DirectUpload` 與 `uploadToR2WithProgress`。

```typescript
const res = await generalR2DirectUpload({
  file,                       // File 物件
  category: 'image',          // image | video | zip | other
  onProgress: (p) => { progress.value = p; }, // 0~100
  relatedId,                  // 選填，關聯業務 ID
  relatedType                 // 選填，關聯業務類型
});
if (!res.success) { /* res.error */ return; }
// res.fileId / res.url
```

實作差異（已對齊本專案）：
- token 取自 `StoreSelf().apiToken`（不再由參數傳入）。
- 後端回傳採本專案 `ApiRes` envelope，成功判斷為 `status.code === $enum.apiStatus.success`（= 200），錯誤訊息取 `status.message.zh_tw`。
- 進度版用 `XMLHttpRequest`；若不需進度也可用 `fetch`，但**無法顯示進度**。
- ⭐ XHR PUT 的 `Content-Type` 必須與發簽署時帶的 `mimeType` 一致，否則 R2 簽章驗證失敗（403）。

---

## 7. Key 命名規範

格式固定為：

```
{category}/{YYYY}/{MM}/{timestamp}_{uuid}_{淨化後原檔名}.{ext}
例：image/2025/11/1702864592_a1b2c3d4-...-ef12_my_photo.jpg
```

- **`category` 分桶**：`image` / `video` / `zip` / `other`（可再加業務分類）。
- **`YYYY/MM` 分月**：避免單一前綴下物件過多，列表 / 清理更好管理。
- **`timestamp_uuid` 前綴**：保證唯一、永不覆蓋。
- **淨化原檔名**：`replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50)` — 去除中文 / 特殊字元 / 空白，避免 URL 編碼與 key 相容性問題，但保留可讀性方便除錯。

---

## 8. 後端產生的檔案（不走前端直傳）

PDF 報表、資料庫備份等由後端產生的檔案，直接用 `uploadToR2` / `downloadFromR2`：

```typescript
// 上傳後端產生的 PDF
const key = generateR2Key('report', `${Date.now()}_${randomUUID()}.pdf`);
await uploadToR2(key, pdfBuffer, 'application/pdf');

// 大檔（備份）串流下載到本地再處理，避免整檔讀進記憶體
await downloadFromR2(backupKey, '/tmp/restore.dump');
```

---

## 9. 簽名有效期（TTL）建議

| 場景 | 建議 TTL | 理由 |
|------|---------|------|
| 上傳 presigned URL | 3600s（1hr） | 給大檔較長上傳餘裕 |
| 一般檔案瀏覽（302 跳轉） | 3600s（1hr） | 每次點 `/files/:id` 重新簽，不必長 |
| 強制下載連結 | 1800s（30min） | 點了就下載，短即可 |
| 對外 / 分享連結 | 900s（15min） | 對外曝險大，越短越安全 |

> signed URL 一旦簽出，在有效期內**任何人拿到都能存取**。對外連結務必縮短 TTL，且不要記進日誌 / 不要長期儲存。

---

## 10. ⚠️ 注意事項與踩雷清單

| # | 重點 | 說明 |
|---|------|------|
| 1 | **CORS 沒設 = 上傳全失敗** | 前端直傳必設 bucket CORS（§3.4），漏掉本機 dev port 或正式網域都會被瀏覽器擋。 |
| 2 | **PUT 的 Content-Type 必須一致** | 發簽署時帶的 `mimeType` 與 XHR PUT 的 `Content-Type` 不一致 → R2 簽章驗證失敗（403）。 |
| 3 | **confirm 必做存在檢查** | 第 ③ 步沒 `HeadObject` 確認就寫 DB，會產生「DB 有記錄、R2 沒檔」的孤兒。 |
| 4 | **region 固定 `'auto'`** | R2 不是真實 AWS region，填錯（如 `us-east-1`）會連不上。 |
| 5 | **endpoint 不含 bucket 名** | endpoint 是 `https://<accountId>.r2.cloudflarestorage.com`，bucket 走 `Bucket` 參數，別塞進 URL。 |
| 6 | **跨來源下載靠 server-side disposition** | 前端 `<a download>` 對跨來源 URL 無效；要強制下載得在 signed URL 帶 `ResponseContentDisposition`（`getR2SignedUrl` 第三參數）。預覽則用不帶的版本。 |
| 7 | **大檔別用 `getR2Object`** | 它會整檔讀進記憶體；備份 / 影片等大檔用 `downloadFromR2` 串流。 |
| 8 | **批次刪除上限 1000** | `DeleteObjectsCommand` 每批最多 1000 件，`deleteManyFromR2` 已自動分批。 |
| 9 | **secret 不可進前端 / git** | `R2_SECRET_ACCESS_KEY` 只在後端用，前端永遠只拿「短期 presigned URL」。 |
| 10 | **signed URL 等於暫時通行證** | 有效期內誰拿到誰能存取，別記進 log。永久連結存 DB（要存就存 `/files/:id`）。 |
| 11 | **大檔要放寬上傳逾時** | 前端 XHR timeout 與大小上限都要對齊。本套路直傳不經後端，後端 bodySize 不受影響。 |
| 12 | **清理 / 歸檔要主動做** | R2 不會自己刪檔。有保存期限需求（如 N 天清理）需用排程 / 觸發，呼叫 `deleteManyFromR2` 並同步更新 DB。 |
| 13 | **缺環境變數要早失敗** | `getR2Client` 在未設定時直接丟錯；建議啟動或健康檢查時呼叫 `isR2Available()` 早期發現缺漏。 |

---

## 11. 落地 Checklist（新落地 / 啟用後端時）

- [ ] `npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner`
- [ ] 取消 `.env*` R2 區塊註解並填值（機密只放本機 `.env`）
- [ ] Cloudflare 建 bucket + Object Read & Write 的 API Token
- [ ] **bucket 設 CORS**（含所有前端來源，方法含 `PUT` `GET`）
- [x] `server/utils/r2-storage.ts`（已建）
- [ ] 建 `@@/utils/{jwt,response,prisma}` 後端基礎設施（啟用後端的前提）
- [ ] 建 `presigned` / `confirm` 兩支後端 API（confirm 必含 `HeadObject` 檢查）
- [ ] 建 `GET /files/:id` 存取端點（302 跳轉 signed URL）
- [ ] DB 建 `UploadFile` 記錄表（§5.4）
- [x] `app/utils/general-r2-upload.ts`（已建）
- [ ] 用「上傳 → confirm → `/files/:id` 開檔 → 刪除」跑一次端到端測試
- [ ] 規劃歸檔 / 清理策略（若有保存期限需求）

---

## 12. 連線自檢（可選）

可放一支 `scripts/test-r2-connection.ts`，部署前用 `npx tsx scripts/test-r2-connection.ts` 驗證：
①必要環境變數是否齊 ②Node / OpenSSL 版本 ③實際上傳一個小檔再刪除（驗證憑證、endpoint、CORS 與連線正確性）④失敗時印出具體錯誤與排查建議。

> 來源：抽象自其他專案的 R2 實戰實作，適配本專案前端樣板狀態（後端為樣板規範）。最後更新：2026-06-16。
