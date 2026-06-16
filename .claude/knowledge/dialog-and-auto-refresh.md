# 彈窗系統 + 前端自動更新機制

本基底兩個跨業務、可直接套用的機制：

1. **彈窗系統（`$open`）** — 以「Pinia Store + Promise」統一管理所有對話框（Drawer / Dialog / Modal），呼叫端 `await` 即可拿到結果。
2. **前端自動更新** — 部署新版後，已開啟頁面的使用者在「下次切換路由」時自動載入新版，無需手動 F5；完全由 Nuxt 4 原生提供。

---

## 一、彈窗系統

### 1. 設計理念

捨棄「每個頁面自己管理 `v-model:visible`」的傳統作法，改成**集中式 + Promise 化**：

- 全站只有一個容器（`open/group/index.vue`，掛在 `app.vue`），統一渲染目前開啟中的彈窗。
- 呼叫彈窗 = 呼叫一支 async function：`const res = await $open.DialogExampleEdit(id)`。
- 關閉時 Promise resolve；**取消回 `false`，成功回帶值的結果**。
- 支援同時多開／巢狀彈窗（各自有 uuid）。

```
呼叫端 await $open.OpenXxx(p)
  └ Open() 建 Promise，把 {uuid, componentName, params, resolve} push 進 StoreOpen
       └ OpenGroup 監聽清單 → <component :is> 動態渲染
            └ 彈窗成功時 resolve(result) → 關閉 → 清單移除 → Promise 解決
```

### 2. 核心檔案（皆已存在，不用重寫）

| 角色 | 檔案 |
|------|------|
| Store（清單） | `app/stores/4.store-open.ts`（`StoreOpen`：`openList` / `OnOpen` / `OnClose` / `OnCloseAll`） |
| 入口函式 | `app/components/open/index.ts`（`Open()` + 各彈窗封裝 + `Close` / `CloseAll` / `CloseName`） |
| 全局工具 | `app/utils/$open.ts`（auto-import 成 `$open`） |
| 容器 | `app/components/open/group/index.vue`（`#OpenGroup`，已掛於 `app.vue`） |
| 狀態 composable | `app/composables/app/use-open-com-option.ts`（`UseOpenComOption`：`visible` / `isChange` / `isSendLock`） |
| 確認對話框 | `app/composables/app/use-ask.ts`（`UseAsk`：`Delete` / `Cancel` / `ChangeClose`…） |
| 基底元件 | `app/components/el/drawer-plus.vue`、`dialog-plus.vue`、`modal-plus.vue` |

> **關閉一律 `resolve(false)`**：`OnClose` 把關閉當「取消」。彈窗成功時已先 `resolve(result)`，Promise 只認第一次 resolve，故關閉時的 `resolve(false)` 自動失效。呼叫端因此能用 `if (!res) return;` 統一判斷取消。

### 3. 三種型態

| 型態 | 基底 | 視覺 | 範本 |
|------|------|------|------|
| Drawer 抽屜 | `ElDrawerPlus` | 側邊滑出 | `open/drawer/example/info/`（`OpenDrawerExampleInfo`） |
| Dialog 對話框 | `ElDialogPlus` | 置中、可拖曳 | `open/dialog/example/edit/`（`OpenDialogExampleEdit`，示範回傳值） |
| Modal 自訂彈層 | `ElModalPlus` | 自訂遮罩置中、無 ElDialog 外框 | `open/modal/example/info/`（`OpenModalExampleInfo`） |

三者皆吃同一套 props 慣例：`v-model`（開關）、`title`、`type`（`edit` / `info`）、`isChange`（觸發關閉二次確認）、`width`（行動裝置自動滿版）、`#footer` slot 提供 `AskClose`。

### 4. 標準寫法（index + form 兩層）

`index.vue` 負責佈局與按鈕、`form.vue` 負責表單與業務流程。

```pug
//- open/dialog/example/edit/index.vue
ElDialogPlus.OpenDialogExampleEdit(
  v-model="$option.visible.value"
  type="edit"
  :title="title"
  :isChange="$option.isChange.value"
  width="700px"
)
  OpenDialogExampleEditForm(
    ref="elForm"
    :params="props.params"
    :resolve="props.resolve"
    @on-change="$option.OnChange"
    @on-close="$option.OnClose"
  )
  template(#footer="{ AskClose }")
    ElButton(@click="AskClose") 取消
    ElButton(type="primary" :disabled="$option.isSendLock.value" @click="ClickSubmit") 確定
```

```ts
// open/dialog/example/edit/form.vue（送出流程）
const SubmitFlow = async (): Promise<boolean> => {
  const valid = await elForm.value?.validate().catch(() => false);
  if (!valid) return false;
  // const res = await ApiSave(form); if (!res) return false;
  props.resolve({ id: props.params.id, name: form.name }); // 回帶值給呼叫端
  emit('on-close');                                         // 關閉（容器移除）
  return true;
};
defineExpose({ SubmitFlow });
```

### 5. 呼叫端

```ts
// 有回傳值（編輯 / 挑選類）
const res = await $open.DialogExampleEdit(10);
if (!res) return;          // 使用者取消 / 關閉
console.log(res);          // { id, name }

// 無回傳值（純資訊 / 建立類，內部自行刷新列表）
await $open.ModalExampleInfo(10);
```

### 6. 確認對話框（`UseAsk`）

「刪除 / 取消 / 關閉」等一次性確認**不用**寫彈窗組件，用回傳 `boolean` 的 `UseAsk()`（內部封裝 `ElMessageBox`，禁止直接呼叫 `ElMessageBox.confirm/prompt`）：

```ts
const $ask = UseAsk();
if (!await $ask.Delete(row.name)) return;
```

### 7. 新增彈窗 Checklist

1. 在 `open/{drawer|dialog|modal}/` 下建 `業務名/模式/index.vue` + `form.vue`，命名 `Open{Drawer|Dialog|Modal}{業務名稱}{模式}`。
2. `index.vue` 用對應 `*Plus` 基底 + `UseOpenComOption`；`form.vue` 成功時 `props.resolve(result)` + `emit('on-close')`。
3. `_index.d.ts` 的 `OpenComponent` 聯集補組件名。
4. `index.ts` 補開啟方法：`OpenXxx: (p) => Open<回傳型別 | false>('OpenXxx', p)`。
5. 呼叫：`const res = await $open.OpenXxx(p); if (!res) return;`。

---

## 二、前端自動更新機制

### 1. 目標

部署新版後，已開啟的使用者不必登出、也不必手動 F5，在下次切換路由時自動載入新版 bundle。完全由 Nuxt 4 原生提供，**專案內不需自寫版本檢查或 WebSocket，也不應出現 `reloadNuxtApp()`**。

### 2. 設定（`nuxt.config.ts`）

```ts
experimental: {
  appManifest: true,                         // 產生版本 manifest，以 buildId 標記版本
  checkOutdatedBuildInterval: 5 * 60 * 1000, // client 背景每 5 分鐘比對最新 buildId
  emitRouteChunkError: 'automatic'           // chunk 載入失敗時於下次導航自動整頁刷新
}
```

| 設定 | 值 | 作用 |
|------|-----|------|
| `appManifest` | `true` | build 產生 `_nuxt/builds/meta/<uuid>.json`，以 buildId 標記版本（後者前提） |
| `checkOutdatedBuildInterval` | `5 * 60 * 1000` | client 背景每 5 分鐘比對 buildId（Nuxt 預設 1 小時） |
| `emitRouteChunkError` | `'automatic'` | 路由切換時 chunk 已被移除導致載入失敗 → 自動整頁刷新復原 |

> `appManifest` 與 `emitRouteChunkError: 'automatic'` 在 Nuxt 4 多為預設值，此處顯式宣告是為了「設定即文件」，避免未來預設值變動造成行為飄移。`checkOutdatedBuildInterval` 預設為 1 小時，本基底縮短為 5 分鐘。

### 3. 運作流程

1. build 產生新的 UUID 作為 **buildId**。
2. client 載入後，每 5 分鐘背景檢查最新 buildId。
3. 偵測到 buildId 不同 → 不立即刷新，只在記憶體標記「已過期」。
4. 使用者下次切換路由（`<NuxtLink>` / `navigateTo` / `router.push`）時，Nuxt 自動把該次導航轉為**整頁刷新**到目標路由。
5. 使用者看不到任何彈窗或提示，只有瀏覽器原生 loading bar → 無感刷新。

### 4. 首次部署注意

啟用此機制的**第一個版本**部署後，client 身上還沒有 manifest 比對邏輯，須請使用者**手動 F5 一次**；之後每次部署就完全無感。

### 5. 本地驗證

dev 的 HMR 不產生 manifest，必須用 production 模式測：

```bash
npm run build && node .output/server/index.mjs
```

為加速驗證，可暫時把 `checkOutdatedBuildInterval` 改成 `30000`（30 秒），重 build 一次模擬新版部署，觀察切路由是否自動刷新，測完還原。

### 6. 與「業務層局部刷新」的區別

別把它和 `UseMitt()`（`app/composables/tool/use-mitt.ts`）的 `EmitReload()` 搞混：

| | 部署版本自動更新（本節） | 業務層局部刷新（`$mitt`） |
|---|---|---|
| 觸發 | 部署新版 + 切路由 | 彈窗送出後通知列表重載 |
| 範圍 | 整個 app bundle | 單一頁面內資料 |
| 提供者 | Nuxt 4 原生 | `UseMitt()` `EmitReload` / `OnReload` |

兩者互不影響，可並存。

> 最後更新時間：2026-06-16
