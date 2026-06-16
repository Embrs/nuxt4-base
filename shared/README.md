# shared

前後端共享程式碼，以 `~shared` 別名引用（定義於 `nuxt.config.ts`）。

適合放置：
- 前後端共用的 TypeScript 型別（如統一 API 響應格式）
- 與環境無關的常數、列舉
- 純函式工具（不依賴瀏覽器或 Node 專屬 API）

```ts
import type { ApiResponse } from '~shared/types/api';
```

> 純前端樣板階段亦可使用本目錄集中共享型別；待啟用 `server/` 後端後，同一份型別即可由前後端共用。
