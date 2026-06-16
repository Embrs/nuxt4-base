# Element Plus 二次封裝組件（el）

針對 Element Plus 常用組件的二次封裝，統一專案的樣式與行為。

| 組件 | 用途 |
|------|------|
| `dialog-plus.vue`（`ElDialogPlus`） | 對話框封裝，支援 `hiddenHeader`/`hiddenFooter` 等，搭配彈窗系統使用 |
| `drawer-plus.vue`（`ElDrawerPlus`） | 抽屜封裝，常用於 `open/drawer/*` 業務彈窗 |
| `image-plus.vue`（`ElImagePlus`） | 圖片封裝，含載入/失敗預設 |
| `pagination-plus.vue`（`ElPaginationPlus`） | 分頁封裝 |
| `popover-plus.vue`（`ElPopoverPlus`） | 氣泡卡片封裝 |

這些組件透過 `app/components` 自動導入，模板中直接以 PascalCase 使用，無需 import。
覆蓋內部 Element Plus 樣式時，於 scoped 內使用 `:deep()`。
