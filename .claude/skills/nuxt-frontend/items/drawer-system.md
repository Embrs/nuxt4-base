# $open 彈窗系統

## 概述

`$open` 是全局彈窗管理工具，統一管理所有業務彈窗的開啟與生命週期。**抽屜（Drawer）與彈窗（Dialog）一律用 `$open` 呼叫，本專案沒有 `$dialog`**。底層以「Pinia Store + Promise」運作，呼叫端 `await` 即可取得結果。

## 兩種型態

| 型態 | 基底元件 | 視覺 | 範本 |
|------|---------|------|------|
| Drawer 抽屜 | `ElDrawerPlus` | 側邊滑出 | `open/drawer/example/info/`（`OpenDrawerExampleInfo`） |
| Dialog 對話框 | `ElDialogPlus` | 置中、可拖曳 | `open/dialog/example/edit/`（`OpenDialogExampleEdit`） |

## 基本用法

`$open` 的方法名 = 組件名去掉 `Open` 前綴（組件 `OpenDialogCustomerEdit` → 方法 `$open.DialogCustomerEdit`）。

```typescript
// 開啟資訊抽屜（無回傳值，純檢視）
const ClickDetail = (id: number) => {
  $open.DrawerCustomerInfo({ id });
};

// 開啟編輯彈窗（await 取回傳值：成功回帶值、取消/關閉回 false）
const ClickEdit = async (id: number) => {
  const res = await $open.DialogCustomerEdit({ id });
  if (!res) return;          // 使用者取消 / 關閉
  ApiGetList();              // 或用 UseMitt().EmitReload() 通知列表重載
};
```

## 組件命名規範

```
components/open/
├── drawer/customer/info/        # OpenDrawerCustomerInfo（抽屜・客戶資訊）
│   ├── index.vue                #   佈局＋按鈕
│   └── form.vue                 #   表單／業務流程
└── dialog/customer/edit/        # OpenDialogCustomerEdit（彈窗・客戶編輯）
    ├── index.vue
    └── form.vue
```

命名規則：`Open{Drawer|Dialog}{業務名稱}{模式}`（模式為 Info / Edit / Create），組件名由 `open/` 下路徑自動推導；慣例採 `index.vue`（佈局）＋ `form.vue`（表單）兩層。

## 新增一個彈窗

1. 在 `open/drawer/` 或 `open/dialog/` 下建 `業務名/模式/index.vue` + `form.vue`。
2. 在 `app/components/open/_index.d.ts` 的 `OpenComponent` 聯集補上組件名。
3. 在 `app/components/open/index.ts` 補開啟方法：

   ```ts
   /** 開啟客戶編輯 */
   DialogCustomerEdit: (id: number) => Open<CustomerResult | false>('OpenDialogCustomerEdit', { id }),
   ```

4. 呼叫：`const res = await $open.DialogCustomerEdit(1); if (!res) return;`

## 彈窗內部結構

`index.vue` 用對應 `*Plus` 基底搭配 `UseOpenComOption()`，`form.vue` 成功時 `props.resolve(result)` 後 `emit('on-close')`。

```pug
//- open/dialog/customer/edit/index.vue
ElDialogPlus.OpenDialogCustomerEdit(
  v-model="$option.visible.value"
  type="edit"
  :title="title"
  :isChange="$option.isChange.value"
  width="700px"
)
  OpenDialogCustomerEditForm(
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

## 禁止事項

- ❌ 禁止使用不存在的 `$dialog`，抽屜與彈窗統一用 `$open`。
- ❌ 禁止直接使用 `ElMessageBox.confirm/prompt`，簡單確認改用 `UseAsk()`。
- ❌ 禁止在彈窗內再開另一個全屏彈窗。

> 機制原理（Store + Promise、resolve 回傳、自動更新）詳見 [.claude/knowledge/dialog-and-auto-refresh.md](../../../knowledge/dialog-and-auto-refresh.md)。
