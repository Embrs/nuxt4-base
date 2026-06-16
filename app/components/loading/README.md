# 加載型組件（loading）

| 組件 | 用途 | 備註 |
|------|------|------|
| `page.vue`（`LoadingPage`） | 全頁載入動畫，於 `app.vue` 手動引入 | 已在 `nuxt.config.ts` 排除自動註冊，需手動 import |
| `com.vue`（`LoadingCom`） | 區塊/組件層級載入動畫 | 自動導入，直接使用 |

`page.vue` 因需在 `app.vue` 明確控制掛載時機，故排除於自動註冊之外（見 `nuxt.config.ts` 的 `components.ignore`）。
