# Project Context

## Purpose
企業級 Nuxt 4 前端基底樣板（base template），用於快速開啟新專案。
提供彈窗系統、三語系 i18n、Element Plus 二次封裝、主題色、Pinia store
與 API 協定層等基礎建設，讓新案以乾淨且一致的結構起步。

## Tech Stack
- Nuxt 4 / Vue 3 Composition API / TypeScript
- Element Plus（UI）、Pinia（狀態管理）
- Pug（模板）、SCSS（樣式，全局工具由 Vite 自動注入）
- @nuxtjs/i18n（三語系 zh / en / ja）、@nuxtjs/color-mode（主題色）
- 後端（選配）：Nitro server routes，目前尚未建立端點

## Project Conventions

### Code Style
- 對話、註解一律繁體中文；變數/函式名稱維持英文
- 函式命名：點擊事件 `Click*`、流程控制 `*Flow`、API 呼叫 `Api*`
- SCSS 採 BEM 展平寫法（禁止 `&__` 嵌套、`!important`、內聯樣式、`@import`）
- 詳見 `CLAUDE.md` 與 `.claude/knowledge/frontend-conventions.md`

### Architecture Patterns
- SFC 固定區塊順序（Imports → State → Handlers → Flow → Helpers → Api → Lifecycle → Emits → Expose）
- 彈窗以 `$open` 開啟，集中註冊於 `app/components/open/`
- 後端錯誤以 `return` 回傳（禁止 `throw`），統一響應格式含三語系訊息
- 詳見 `.claude/knowledge/backend-conventions.md`

### Testing Strategy
未配置測試框架（無 `npm test`）；如需測試請依專案需求自行加裝（如 Vitest）。

### Git Workflow
- 主分支 `main`；功能分支開發後合併
- Conventional Commits + 繁體中文描述（`feat:`, `fix:`, `docs:`, `refactor:`, `style:`, `chore:`）

## Domain Context
基底樣板本身無特定業務領域；各新專案應在此補上自身的領域知識。

## Important Constraints
- Node.js >= 24.13.0
- 預設語系繁中，路由策略 `prefix_except_default`

## External Dependencies
基底本身不綁定外部服務。各新專案啟用後端 / 物件儲存（如 PostgreSQL、Cloudflare R2）時，
於 `.env` 補上對應變數（範本見 `.env.example`）。
