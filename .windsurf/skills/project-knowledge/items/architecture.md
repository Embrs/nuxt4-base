# 目錄結構

> 動態生成，請根據實際專案結構更新

## 整體結構

```
{專案名稱}/
├── app/                    # 前端應用
│   ├── pages/              # 頁面路由
│   ├── components/         # Vue 組件
│   ├── composables/        # 組合式函數
│   ├── stores/             # Pinia 狀態管理
│   ├── utils/              # 工具函數
│   ├── layouts/            # 佈局模板
│   └── protocol/           # API 接口定義
│
├── server/                 # 後端 API
│   ├── routes/             # API 端點
│   ├── schemas/            # 驗證 Schema
│   ├── utils/              # 工具函數
│   ├── middleware/         # 中間件
│   └── plugins/            # 插件
│
├── prisma/                 # 資料庫
│   ├── schema.prisma       # 資料模型
│   ├── migrations/         # 遷移檔案
│   └── seed.ts             # 種子資料
│
├── shared/                 # 共用類型
│   └── types/              # TypeScript 類型定義
│
├── .windsurf/                 # AI Agent 配置
│   ├── skills/             # Agent Skills（9個專業技能）
│   │   ├── debugging/       # 調試技能
│   │   ├── deployment/      # 部署技能
│   │   ├── element-plus-ui/ # Element Plus UI 技能
│   │   ├── nuxt-backend/    # Nuxt 後端開發技能
│   │   ├── nuxt-frontend/   # Nuxt 前端開發技能
│   │   ├── prisma-database/ # Prisma 資料庫技能
│   │   ├── project-knowledge/ # 專案知識庫技能
│   │   ├── testing/         # 測試驗證技能
│   │   └── user-feedback/   # 用戶回饋技能
│   └── workflows/          # 工作流程
│       ├── git-commit.md   # Git 提交流程
│       ├── mcp-test.md     # MCP 測試流程
│       ├── project-init.md # 專案初始化流程
│       └── user-feedback.md # 用戶回饋收集流程
│
└── .memory/                # AI 記憶庫
    ├── archive/            # 歷史歸檔
    └── context/            # 業務規則
```

## 分層設計

```
┌─────────────────────────────────────┐
│             前端 (app/)             │
│  Pages → Components → Composables  │
│              ↓                      │
│         protocol/$api               │
└─────────────────────────────────────┘
              ↓ HTTP
┌─────────────────────────────────────┐
│           後端 (server/)            │
│  Routes → Utils → Prisma Client    │
└─────────────────────────────────────┘
              ↓ SQL
┌─────────────────────────────────────┐
│           資料庫 (Database)         │
└─────────────────────────────────────┘
```

## 關鍵配置檔案

| 檔案 | 用途 |
|------|------|
| `nuxt.config.ts` | Nuxt 配置 |
| `prisma/schema.prisma` | 資料庫模型 |
| `Dockerfile` | Docker 構建 |
| `.env` | 環境變數（本地） |

## 同步檢查

執行 `scripts/sync-check.sh` 可查看實際數量統計：
```bash
bash .windsurf/skills/project-knowledge/scripts/sync-check.sh
```
