/** GraphQL 請求參數 */
interface GqlRequest {
  query: string            // GraphQL 查詢/變更字串
  variables?: Record<string, any>    // GraphQL 變數
  operationName?: string   // 指定 operation 名稱（可選）
}

/** GraphQL 原生回傳（參考規範） */
interface GqlRawResponse<T = Record<string, any>> {
  data?: T
  errors?: Array<{
    message: string
    path?: (string | number)[]
    extensions?: Record<string, any>
  }>
}

/** 專案統一回傳格式（轉換自 GraphQL 原生回傳） */
interface GqlRes<T = Record<string, any>> {
  data: T
  status: {
    code: number // 0 為正常
    message: {   // 錯誤訊息（沿用 fetch-api 規格）
      zh_tw: string
      en: string
      ja: string
    }
  }
}

/** GraphQL 客製化選項 */
interface GqlOptions {
  endpoint?: string        // 預設 '/graphql'，可依環境自訂
  showError?: boolean      // 是否顯示錯誤（交由 UI 處理，預留鉤子）
}
