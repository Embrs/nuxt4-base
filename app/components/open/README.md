# 彈窗型組件（open）

以 `$open` 全局工具開啟的業務彈窗，由 `StoreOpen` 統一管理生命週期。三種型態共用同一套「Pinia Store + Promise」機制，呼叫端 `await` 即可拿到結果：

| 型態 | 基底元件 | 視覺 | 範本 |
|------|---------|------|------|
| **Drawer** 抽屜 | `ElDrawerPlus` | 側邊滑出 | `drawer/example/info/`（`OpenDrawerExampleInfo`） |
| **Dialog** 對話框 | `ElDialogPlus` | 置中、含拖曳 | `dialog/example/edit/`（`OpenDialogExampleEdit`） |
| **Modal** 自訂彈層 | `ElModalPlus` | 自訂遮罩置中、無 ElDialog 外框 | `modal/example/info/`（`OpenModalExampleInfo`） |

> 機制原理與「前端自動更新」一併整理於 [.claude/knowledge/dialog-and-auto-refresh.md](../../../.claude/knowledge/dialog-and-auto-refresh.md)。

## 結構

| 檔案 | 用途 | 是否需修改 |
|------|------|-----------|
| `index.ts` | `$open` 的開啟/關閉方法（`Open`、`Close`、`CloseAll`、`CloseName`） | 新增彈窗時補方法 |
| `_index.d.ts` | `OpenComponent`（組件名聯集）與 `OpenParams` 型別 | 新增彈窗時補型別 |
| `group/index.vue` | 彈窗渲染器（不用動） | 否 |
| `drawer/` `dialog/` `modal/` | 三種型態的業務彈窗，依型態分目錄 | 在對應目錄下新增 |

## 新增一個彈窗

1. 在 `drawer/`、`dialog/` 或 `modal/` 下建立組件，命名 `Open{Drawer|Dialog|Modal}{業務名稱}{模式}.vue`（Info / Edit / Create）。
   - 組件名由路徑自動推導（如 `open/dialog/user/edit/index.vue` → `OpenDialogUserEdit`）。
   - 慣例採 `index.vue`（佈局＋按鈕）＋ `form.vue`（表單／業務流程）兩層。
2. 在 `_index.d.ts` 的 `OpenComponent` 聯集補上組件名。
3. 在 `index.ts` 補上開啟方法：

   ```ts
   /** 開啟使用者編輯 */
   DialogUserEdit: (id: number) => Open<UserResult | false>('OpenDialogUserEdit', { id }),
   ```

4. 呼叫：`const res = await $open.DialogUserEdit(1); if (!res) return;`

## 回傳值（resolve）

- 容器（`group/index.vue`）會把 `resolve` 注入每個彈窗。
- **要回傳結果**（編輯／挑選類）：在 `form.vue` 宣告 `resolve` prop，送出成功時呼叫 `props.resolve(result)` 後再 `emit('on-close')`。
- **不需回傳**（純資訊／關閉即可）：忽略 `resolve`，關閉時容器會 `resolve(false)`，故呼叫端統一用 `if (!res) return;` 判斷取消。

## 注意

- 確認對話框一律用 `UseAsk()` composable，**禁止** `ElMessageBox.confirm/prompt`。
- 彈窗內取用 `UseOpenComOption()` 控制顯示／關閉與送出鎖；有變更時設 `isChange`，三種基底皆會在關閉前跳二次確認。
- 列表局部刷新用 `UseMitt()` 的 `EmitReload()`（業務層資料刷新，與部署版本自動更新互不影響）。
