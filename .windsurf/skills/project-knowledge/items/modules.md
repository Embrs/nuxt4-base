# 功能模組清單

> 動態生成，請根據實際專案模組更新

## 模組分類

### 核心模組

| 模組名稱 | 後端路徑 | 前端頁面 | 狀態 |
|----------|----------|----------|------|
| 使用者管理 | `server/routes/user/` | `pages/user/` | - |
| 角色權限 | `server/routes/role/` | `pages/role/` | - |
| 系統設定 | `server/routes/system/` | `pages/system/` | - |

### AI 技能模組

| 模組名稱 | 技能路徑 | 功能描述 | 狀態 |
|----------|----------|----------|------|
| 調試技能 | `.windsurf/skills/debugging/` | Chrome DevTools MCP、前後端調試 | ✅ |
| 部署技能 | `.windsurf/skills/deployment/` | Dockerfile、Railway 部署、環境變數 | ✅ |
| Element Plus UI | `.windsurf/skills/element-plus-ui/` | 表單/表格/彈窗組件規範 | ✅ |
| Nuxt 後端 | `.windsurf/skills/nuxt-backend/` | API 響應、錯誤處理、Zod 驗證 | ✅ |
| Nuxt 前端 | `.windsurf/skills/nuxt-frontend/` | SFC 結構、全局工具、SCSS 樣式 | ✅ |
| Prisma 資料庫 | `.windsurf/skills/prisma-database/` | 查詢模式、事務處理、空值處理 | ✅ |
| 專案知識庫 | `.windsurf/skills/project-knowledge/` | 架構理解、模組查找、知識維護 | ✅ |
| 測試驗證 | `.windsurf/skills/testing/` | UI 測試、API 測試、整合測試 | ✅ |
| 用戶回饋 | `.windsurf/skills/user-feedback/` | 回饋收集、溝通品質 | ✅ |

### 工作流程模組

| 模組名稱 | 工作流程路徑 | 功能描述 | 狀態 |
|----------|-------------|----------|------|
| Git 提交 | `.windsurf/workflows/git-commit.md` | 變更提交 + 知識庫維護 | ✅ |
| MCP 測試 | `.windsurf/workflows/mcp-test.md` | MCP 工具測試流程 | ✅ |
| 專案初始化 | `.windsurf/workflows/project-init.md` | 專案架構初始化 | ✅ |
| 用戶回饋 | `.windsurf/workflows/user-feedback.md` | 回饋收集工作流程 | ✅ |

## 模組關係圖

```
┌──────────────┐     ┌──────────────┐
│   使用者管理  │ ←── │   角色權限    │
└──────────────┘     └──────────────┘
        ↓
┌──────────────┐
│   業務模組    │
└──────────────┘

┌─────────────────────────────────────────────────────────┐
│                  AI 技能工具包                          │
├──────────────┬──────────────┬──────────────┬─────────┤
│   前端開發    │   後端開發    │   UI 組件     │  測試   │
│  nuxt-frontend│  nuxt-backend │element-plus-ui│ testing │
├──────────────┼──────────────┼──────────────┼─────────┤
│   資料庫      │   部署        │   調試        │  知識庫 │
│prisma-database│  deployment   │  debugging   │project- │
│              │              │              │knowledge│
└──────────────┴──────────────┴──────────────┴─────────┘
                                ↓
┌─────────────────────────────────┐
│        工作流程模組             │
│  git-commit │ mcp-test │ user-  │
│             │          │ feedback│
└─────────────────────────────────┘
```

## 如何更新

新增功能模組時，請更新此文件：

1. 添加模組到對應表格
2. 更新模組關係圖（如有依賴）
3. 記錄到 `references/maintenance-log.md`
