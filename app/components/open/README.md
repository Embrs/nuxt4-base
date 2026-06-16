# 彈窗型組件（open）

以 `$open` 全局工具開啟的業務彈窗（Drawer / Dialog），由 `StoreOpen` 統一管理生命週期。

## 結構

| 檔案 | 用途 | 是否需修改 |
|------|------|-----------|
| `index.ts` | `$open` 的開啟/關閉方法（`Open`、`Close`、`CloseAll`、`CloseName`） | 新增彈窗時補方法 |
| `_index.d.ts` | `OpenComponent`（組件名聯集）與 `OpenParams` 型別 | 新增彈窗時補型別 |
| `group/index.vue` | 彈窗渲染器（不用動） | 否 |
| `drawer/example/` | `$open` 抽屜範本（`OpenDrawerExampleInfo`） | 可作為新彈窗起點 |

## 新增一個彈窗

1. 在 `drawer/` 或 `dialog/` 下建立組件，命名 `Open{Drawer|Dialog}{業務名稱}{模式}.vue`（Info / Edit / Create）。
   - 組件名由路徑自動推導（如 `open/dialog/user/edit.vue` → `OpenDialogUserEdit`）。
2. 在 `_index.d.ts` 的 `OpenComponent` 聯集補上組件名。
3. 在 `index.ts` 補上開啟方法：

   ```ts
   /** 開啟使用者編輯 */
   DialogUserEdit: (id: number) => Open('OpenDialogUserEdit', { id }),
   ```

4. 呼叫：`const res = await $open.DialogUserEdit(1);`

## 注意

- 確認對話框一律用 `UseAsk()` composable，**禁止** `ElMessageBox.confirm/prompt`。
- 彈窗內取用 `UseOpenComOption()` 控制顯示/關閉與送出鎖。
