/** Enum 庫 */
/** API 狀態 */
const apiStatus: Record<ApiStatus, string> = {
  '': '-',
  200: '成功',
  400: '失敗',
  401: '未授權',
  403: '禁止存取',
  404: '找不到',
  500: '系統錯誤'
};


export default {
  /** API 狀態 */
  apiStatus
};
