# Nuxt4 Base 專案

基於 Nuxt 4 的企業級前端開發框架，整合現代化工具鏈與最佳實踐。

## 🚀 專案特色

- **Nuxt 4** 最新版本，支援 Vue 3 Composition API
- **Element Plus** 企業級 UI 組件庫
- **多語系支援** 繁體中文、英文、日文
- **TypeScript** 完整類型支援
- **SCSS** 模組化樣式系統
- **Pinia** 狀態管理
- **ESLint** 代碼規範檢查
- **響應式設計** 支援多裝置適配

## 📦 技術棧

### 核心框架
- [Nuxt 4](https://nuxt.com/) - Vue 全端框架
- [Vue 3](https://vuejs.org/) - 漸進式 JavaScript 框架
- [TypeScript](https://www.typescriptlang.org/) - 類型安全的 JavaScript

### UI & 樣式
- [Element Plus](https://element-plus.org/) - Vue 3 UI 組件庫
- [SCSS](https://sass-lang.com/) - CSS 預處理器
- [@nuxtjs/color-mode](https://color-mode.nuxtjs.org/) - 暗黑模式支援
- [@nuxt/icon](https://github.com/nuxt/icon) - 圖示系統

### 開發工具
- [ESLint](https://eslint.org/) - 代碼品質檢查
- [Pinia](https://pinia.vuejs.org/) - 狀態管理
- [VueUse Motion](https://motion.vueuse.org/) - 動畫效果
- [Day.js](https://day.js.org/) - 日期處理

## 🛠️ 專案技能工具包

此專案整合了專用的 AI 技能工具包，提供完整的開發支援：

### 📚 技能列表

#### **nuxt-frontend** - Nuxt 前端開發技能
- SFC 組件結構規範
- 全局工具（$api/$open/$dayjs）使用
- SCSS 樣式系統
- Vue 3 Composition API 最佳實踐

#### **nuxt-backend** - Nuxt 後端開發技能  
- API 響應格式標準
- 錯誤處理機制（return 非 throw）
- Zod 資料驗證
- JWT 認證實作

#### **element-plus-ui** - Element Plus UI 組件技能
- 表單/表格/彈窗組件使用規範
- 組件限制與注意事項
- 樣式客製化技巧

#### **prisma-database** - Prisma ORM 資料庫技能
- 查詢模式最佳實踐
- 事務處理標準
- 空值處理規範（重要）
- 軟刪除實作

#### **debugging** - 調試技能
- Chrome DevTools MCP 操作
- 前後端調試技巧
- 問題診斷流程

#### **deployment** - 部署技能
- Dockerfile 配置
- Railway 部署流程
- 環境變數設定

#### **testing** - 測試驗證技能
- 前端 UI 測試（Chrome DevTools MCP）
- 後端 API 測試
- 整合測試策略

#### **project-knowledge** - 專案知識庫技能
- 專案架構理解
- 模組位置查找
- 知識庫維護

#### **user-feedback** - 用戶回饋技能
- 回饋收集流程
- 溝通品質提升

### 🎯 技能工具包來源

詳細技能文檔與使用指南：[nuxt4-skills](https://github.com/Embrs/nuxt4-skills)

## 📁 專案結構

```
nuxt4-base/
├── app/                    # 應用程式核心
│   ├── assets/            # 靜態資源
│   ├── components/        # Vue 組件
│   ├── composables/       # Composition API
│   └── pages/            # 頁面路由
├── .windsurf/             # AI 技能工具包
│   └── skills/            # 專業技能庫
├── i18n/                  # 多語系設定
├── public/               # 公共資源
├── types/                # TypeScript 類型定義
└── version.ts           # 版本管理
```

## 🚀 快速開始

### 環境需求

- Node.js >= 24.13.0
- npm、pnpm、yarn 或 bun

### 安裝依賴

```bash
# npm
npm install

# pnpm (推薦)
pnpm install

# yarn
yarn install

# bun
bun install
```

### 開發伺服器

啟動開發伺服器於 `http://localhost:3000`：

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

### 生產建置

建置應用程式用於生產環境：

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

### 本地預覽

預覽生產建置：

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun preview
```

## 🔧 開發規範

### 代碼風格
- 使用 ESLint 進行代碼檢查
- 遵循 Vue 3 Composition API 最佳實踐
- TypeScript 嚴格模式

### 提交規範
遵循 Conventional Commits：
- `feat:` 新功能
- `fix:` 錯誤修復
- `docs:` 文檔更新
- `refactor:` 重構
- `style:` 樣式調整
- `test:` 測試相關

### 分支策略
- `main` 主分支
- `develop` 開發分支
- `feature/*` 功能分支
- `hotfix/*` 熱修復分支

## 🌐 部署

### Docker 部署

```bash
# 建置 Docker 映像
docker build -t nuxt4-base .

# 執行容器
docker run -p 3000:3000 nuxt4-base
```

### 平台部署
支援 Vercel、Netlify、Railway 等現代部署平台

詳細部署指南請參考：[Nuxt 部署文檔](https://nuxt.com/docs/getting-started/deployment)

## 📖 API 文檔

### 全局工具
- `$api()` - API 請求封裝
- `$open()` - 彈窗/對話框工具
- `$dayjs` - 日期處理工具

### 組件規範
- 使用 `<script setup>` 語法
- 組件命名採用 PascalCase
- Props 需定義 TypeScript 類型

## 🤝 貢獻指南

1. Fork 專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📄 授權

本專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 檔案

## 🔗 相關連結

- [Nuxt 官方文檔](https://nuxt.com/docs)
- [Vue 3 文檔](https://vuejs.org/guide/introduction.html)
- [Element Plus 文檔](https://element-plus.org/)
- [專案技能工具包](https://github.com/Embrs/nuxt4-skills)
- [問題回報](https://github.com/Embrs/nuxt4-base/issues)
