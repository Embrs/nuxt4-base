# 專案規則說明
請依照以下規範產生程式碼：

## 語言與框架
- 本專案統一使用 **TypeScript**，不要產生 JavaScript。
- 使用 **Nuxt 4** 作為框架，請依循官方推薦寫法。
- 使用 **Eslint 9** 作為框架，請依循官方推薦寫法。
- 使用 **Pug** 作為模板引擎，請依循官方推薦寫法。
- 使用 **SCSS** 作為 CSS 框架，請依循官方推薦寫法。
- 使用 **Element Plus** 作為 UI 框架，請依循官方推薦寫法。

## 命名規範
- 變數名稱：使用 **小駝峰 camelCase** 命名。
- 函式名稱：使用 **大駝峰 CamelCase** 命名。
- TS type interface：使用 **大駝峰 CamelCase** 命名。
- 檔案名稱：使用 **烤肉串 kebab-case** 命名。
- 常數：使用 **全大寫蛇形命名 (UPPER_SNAKE_CASE)** 命名。

## 程式風格
- 一律使用 `const` 或 `let`，不要使用 `var`。
- 使用 `async/await`，避免 `.then()`。
- 函式請優先使用 **箭頭函式 ()=>{}** 設計開發。
- Nuxt4 已將 ref computed onMounted 等常用api函式全局引入，請勿再引入。

## 格式化
- 縮排使用 **2 空白**。
- 使用 **單引號 (')** 而不是雙引號。
- 結尾必須加上 **分號**。

## 文件與註解
- 註解請以 **繁體中文** 撰寫。
- 函式需有 **JSDoc** 註解，說明參數與回傳值。
- 變數、型別(TS type interface)宣告需要有 **JSDoc** 註解。
- 當輸入 /* 時，是要為下一行做註解，請自動補全為 /** 並產生 JSDoc 範本。
- ./utils 已暴露在全局，如 $api 等，可直接調用裡面的 restful API

## 元件開發風格與檔案結構（取自 `.vscode/demo.vue`）
- 檔頭統一使用 `<script setup lang="ts">` 與 TypeScript。
- 單檔元件（SFC）內部區塊順序如下，請以分段註解標示：
  1. 引入（Imports）
  2. 資料（型別、props、refs、狀態）
  3. 接收事件（watch、事件處理）
  4. 流程（初始化、流程控制）
  5. 函式（一般工具函式）
  6. Api（資料請求）
  7. 生命週期（onMounted / onBeforeUnmount 等）
  8. 發送事件（emit 型別與執行）
  9. 對外暴露（defineExpose）

- 具體規範：
  - Props：以 `type Props = {}` 定義並使用 `withDefaults(defineProps<Props>(), { ... })` 設定預設值。
  - Template Ref：使用 `useTemplateRef('elForm')` 等語義化名稱。
  - 監聽：`watch(() => ..., () => ..., { deep: true, immediate: true })` 依需求調整參數。
  - 事件命名：
    - 內部函式以小駝峰，如 `const onClick = () => {}`。
    - 對外自定義事件以 kebab-case，如 `'on-change'`，並以 `type Emit = { 'on-change': [id: number, value: any] }` 配合 `defineEmits<Emit>()`。
  - 對外暴露：以 `defineExpose({ ... })` 明確列出可暴露介面。
  - 模板：使用 `lang="pug"`，根節點類名以元件/頁面名命名，如 `.DemoPage`。
  - 樣式：使用 `<style lang="scss" scoped>`，並以區塊註解分段：
    - 佈局 ----
    - 組件 ----
  - 命名與一致性：檔名與根節點類名對應，例如 `demo-page.vue` 對應 `.DemoPage`。

- 建議範本（簡化自 `demo.vue`）：

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
  // 佈局 ----
  .DemoPage {
    // TODO
  }
  // 組件 ----
  </style>
  ```
