# Nuxt 4 Base

企業級 **Nuxt 4 前端基底樣板**，用於快速開啟新專案。
技術棧：Vue 3 Composition API + TypeScript + Element Plus + Pinia + Pug + SCSS。

> 本倉庫是「開新專案的起點」，內含彈窗系統、三語系 i18n、Element Plus 二次封裝、
> 主題色、Pinia store 與 API 協定層等基礎建設。詳細規範見
> [`CLAUDE.md`](./CLAUDE.md) 與 [`.claude/knowledge/`](./.claude/knowledge/)。

## 開發

```bash
npm install   # 安裝依賴
npm run dev   # 開發伺服器（載入 .env.dev，port 3000）
npm run build # 生產構建
npm run preview
npm run lint  # ESLint 檢查
```

- Node.js 版本需求：`>= 24.13.0`
- 本專案**未配置測試框架**（無 `npm test`）

## 環境變數

| 檔案 | 用途 | 版控 |
|------|------|------|
| `.env.example` | 變數清單範本（含說明） | ✅ 納入 |
| `.env.dev` | 開發環境（`npm run dev` 載入） | ✅ 納入，**禁放機密** |
| `.env` | 本機機密（build/preview 載入） | ❌ 忽略 |

新環境請先 `cp .env.example .env` 再填值。`.env` 與 `.env.dev` 皆**禁止填入真實密碼後提交**。

## 目錄結構

| 路徑 | 說明 |
|------|------|
| `app/` | 應用核心（pages、components、composables、stores、utils、plugins、protocol） |
| `app/components/open/` | 彈窗系統（`$open` 開啟，drawer/example 為範本） |
| `app/components/el/` | Element Plus 二次封裝組件 |
| `server/` | Nitro 伺服器端（`@@` 別名）；**目前為純前端樣板，尚未建立端點** |
| `shared/` | 前後端共享程式碼（`~shared` 別名） |
| `i18n/locales/` | 多語系翻譯（zh / en / ja） |
| `openspec/` | OpenSpec 規格系統 |
| `.claude/` | Claude Code 規範、知識庫與 skills |

路徑別名：`~`→`app`、`@`→`app/assets`、`@@`→`server`、`~shared`→`shared`。

## 用此基底開新專案

1. **改識別資訊**：`package.json` 的 `name`/`description`、`version.ts` 重設為 `0.0.1`。
2. **環境變數**：`cp .env.example .env` 並填入新案值；視需要改 `R2_BUCKET_NAME`、`public/robots.txt`。
3. **移除範例**：刪除 `app/components/open/drawer/example/`，並移除 `app/pages/index.vue` 中的「開啟範例抽屜」按鈕（或整頁改寫）。
4. **填寫規格**：補上 `openspec/project.md` 的專案內容（Purpose / Domain 等）。
5. **i18n**：清除 `i18n/locales/*` 中用不到的 `welcome`/`about` 示範 key。
6. **後端（選配）**：需要時於 `server/routes/nuxt-api/` 建立端點，並依
   [backend-conventions](.claude/knowledge/backend-conventions.md) 撰寫。

> ⚠️ 若曾在本機 `.env` 填過真實憑證，clone 給他人前請確認已清除。
