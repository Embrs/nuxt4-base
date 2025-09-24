# 專案規則說明
本文件統一說明本專案的程式風格與開發規範，請所有協作者（包含 AI 助理）完整遵守。

## 1. 語言與框架
- **TypeScript**：所有程式碼均使用 TypeScript 撰寫，禁止輸出或提交 JavaScript 檔案。
- **Nuxt 4**：採用 Nuxt 4 官方推薦的寫法與檔案結構，不得自行變更核心配置。
- **ESLint 9**：以專案現有設定為準，修正所有 ESLint 報錯與警告。
- **Pug**：所有 Vue SFC 的模板區塊使用 `lang="pug"`，遵照 Pug 官方語法。
- **SCSS**：樣式一律使用 SCSS，並維持既有的樣式結構與變數命名。
- **Element Plus**：當使用 UI 元件時遵循 Element Plus 官方建議做法與元件 API。

## 2. 命名規範
- **變數**：使用小駝峰（`lowerCamelCase`）。
- **函式**：使用大駝峰（`UpperCamelCase`）。
- **Type 與 Interface**：使用大駝峰（`UpperCamelCase`）。
- **檔案**：使用烤肉串命名（`kebab-case`）。
- **常數**：使用全大寫蛇形命名（`UPPER_SNAKE_CASE`）。

## 3. 程式風格
- 僅能使用 `const` 或 `let` 宣告變數，禁止使用 `var`。
- 非同步流程請使用 `async/await`，避免鏈式 `.then()`。
- 函式預設使用箭頭函式（`() => {}`）。
- Nuxt 4 已全域引入 `ref`、`computed`、`onMounted` 等常用 API，請勿重複從 `vue` 匯入。

## 4. 格式化要求
- 縮排固定為 2 個空白字元。
- 字串請使用單引號（`'`）。
- 每行敘述結尾需加上分號（`;`）。

## 5. 文件與註解
- 所有註解必須使用繁體中文撰寫。
- 每個函式需要 JSDoc 註解，說明參數、回傳值與用途。
- 變數、型別（type/interface）宣告也需撰寫對應的 JSDoc。
- 當輸入 `/*` 開始撰寫註解時，請立即補齊為 `/**` 並產生 JSDoc 範本。
- `./utils` 目錄已被全域曝光，可直接呼叫其中的 RESTful API（如 `$api`）。

## 6. 元件開發風格與檔案結構
  - 所有 `ElInput` 都必須加上 `maxlength`。
  - `type="text"` 時：`maxlength` 設為 `200`。
  - `type="textarea"` 時：`maxlength` 設為 `2000`。
  - `type="number"` 時：在 `maxlength` 之外，必須額外設定 `inputmode="numeric"`。
- **檔頭統一**：每個 SFC 以 `<script setup lang="ts">` 開始，並使用 TypeScript。
- **程式區塊順序**：SFC 內部請依下列順序撰寫，並以分段註解標示（即使暫無內容，也以註解說明「(目前無...)」保留占位）：
  1. 引入（Imports）
  2. 資料（型別、props、refs、狀態）
  3. 接收事件（watch、事件處理）
  4. 流程（初始化、流程控制）
  5. 函式（一般工具函式）
  6. Api（資料請求）
  7. 生命週期（`onMounted`、`onBeforeUnmount` 等）
  8. 發送事件（emit 型別與執行）
  9. 對外暴露（`defineExpose`）
- **流程設計**：涉及多步驟（如登入流程）時，需拆分為以下層級：
  - **接收事件**：使用 `Click*` 命名觸發入口，處理節流與狀態切換。
  - **流程控制**：建立 `*Flow`（如 `SignInFlow`）整合衛語句步驟，負責驗證、呼叫 API、資料寫入與導頁。
  - **API 呼叫**：於 `Api` 區塊以 `Api*` 命名獨立封裝對後端的請求。 
  - **資料暫存**：在流程中明確儲存 token、使用者資訊等必要狀態，避免散落處理。
  - **流程註解**：`*Flow` 內的步驟需逐一以繁中註解標示（例如「// 第一步：...」），清楚描述每個衛語句的目的。
  - **衛語句回傳**：流程中的衛語句應直接回傳 `boolean`，例如 `if (isSubmitting.value) return false;` 或 `if (!await formRef.value.validate().catch(() => false)) return false;`，以利流程重複使用與狀態判斷。
- **全域工具**：`app/utils/` 目錄已透過 Nuxt 插件自動注入，可直接使用下列資源（勿手動 `import`）：
  - `$api`：統一的後端請求介面。
  - `$dayjs`：已擴充的 `dayjs` 工具，含自訂格式化方法。
  - `$encrypt`：提供加解密與雜湊相關工具。
  - `$enum`：集中管理枚舉與常數設定。
  - `$lodash`：封裝 `lodash` 常用函式。
  - `$open`：通用的跳窗組件開啟工具。
  - `$tool`：專案共用工具集合。
- **Element Plus 注入**：`nuxt.config.ts` 已啟用 `@element-plus/nuxt` 模組，常用元件（如 `ElMessage`、`ElNotification` ）皆可直接使用，禁止在 SFC 內重複 `import`。
- **API 處理**：封裝 API 函式（命名為 `Api*`）時，統一以 `$api` 發送請求，並檢查 `res.status.code === $enum.apiStatus.success`；成功時回傳 `true` 並於函式內寫入必要資料，失敗則依 `res.status.message` 顯示錯誤並回傳 `false`。
- **共通細節**：
  - Props：以 `type Props = {}` 宣告並搭配 `withDefaults(defineProps<Props>(), { ... })` 指定預設值。
  - Template Ref：使用語意化命名，例如 `useTemplateRef('elForm')`。
  - 監聽：根據需求調整 `watch(() => ..., () => ..., { deep: true, immediate: true })` 的參數設定。
  - 事件命名：
    - 內部函式以小駝峰，例如 `const onClick = () => {}`。
    - 對外自定義事件以 `kebab-case`，例如 `'on-change'`，並以 `type Emit = { 'on-change': [id: number, value: any] }` 搭配 `defineEmits<Emit>()`。
  - 對外暴露：使用 `defineExpose({ ... })` 清楚列出需要暴露的成員。
  - 模板：設定 `lang="pug"`，根節點 class 名稱需與檔名對應，例如 `demo-page.vue` 對應 `.DemoPage`。
  - 模板註解：`<template>` 區塊需使用 `//- -- 區塊說明` 等註解明確標示各段落用途。
  - 區塊占位：即使某段暫時沒有邏輯，也需保留對應區塊註解（例如「// (目前無...)」），以提醒後續維持規範。
  - JSDoc：單句 JSDoc 使用單行格式，例如 `/** 描述文字。*/`，若有多行說明再使用多行格式。
  - 樣式：使用 `<style lang="scss" scoped>`，並以區塊註解區分「佈局 ----」與「組件 ----」，且每個樣式類別或 `:deep` 區段均需撰寫繁體中文用途註解。
  - SCSS 類名撰寫：禁止使用 `&__`、`&--` 等巢狀接續寫法，請以完整類名撰寫，例如 `.SignInForm`、`.SignInForm__actions`。
  - SCSS 工具：在 Vue 檔內撰寫 SCSS 時，請優先引用並使用 `app/assets/styles/scss-tool/` 內既有工具檔，例如 `mixin.scss`、`font-size.scss`、`fn.scss`、`colors.scss`、`rwd.scss`，避免重複定義樣式。
  - SCSS 全局注入：`nuxt.config.ts` 已透過 `vite.css.preprocessorOptions.scss.additionalData` 自動匯入上述工具檔，SFC 內請勿再次以 `@use` / `@import` 重複引用，直接使用已注入的變數與 mixin。

## 7. 建議檔案範本
```vue
<script setup lang="ts">
// -- 引入 --------------------------------------------------------------------------------------------
// * import { } from '...'

// -- 資料 --------------------------------------------------------------------------------------------
// * type Props = {}
// * const props = withDefaults(defineProps<Props>(), {})
// * const elForm = useTemplateRef('elForm')

// -- 接收事件 -----------------------------------------------------------------------------------------
// * watch(() => ..., () => ..., { deep: true, immediate: true })
// * const onClick = () => {}

// -- 流程 --------------------------------------------------------------------------------------------
// * const initFlow = () => {}

// -- 函式 --------------------------------------------------------------------------------------------
// -- Api ---------------------------------------------------------------------------------------------

// -- 生命週期 -----------------------------------------------------------------------------------------
// * onMounted(() => {})
// * onBeforeUnmount(() => {})

// -- 發送事件 -----------------------------------------------------------------------------------------
// * type Emit = { 'on-change': [id: number, value: any] }
// * const emit = defineEmits<Emit>()

// -- 對外暴露 -----------------------------------------------------------------------------------------
// * defineExpose({ })
</script>

<template lang="pug">
.DemoPage
  p DemoPage
</template>

<style lang="scss" scoped>

.DemoPage {
  // TODO
}
</style>
```
