# server

Nitro 伺服器端，以 `@@` 別名引用（定義於 `nuxt.config.ts`）。

> ⚠️ **本專案目前為純前端樣板，`server/` 尚未建立任何端點。**
> 以下為「啟用後端時」的規範參考；實際開發前 `server/routes/` 為空。

啟用後端時，API 路由放在 `server/routes/nuxt-api/{資源}/`，並依
[.claude/knowledge/backend-conventions.md](../.claude/knowledge/backend-conventions.md)
的規範撰寫（錯誤以 `return` 回傳、統一響應格式、三語系錯誤訊息）。
