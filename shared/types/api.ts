// 前後端共享型別：統一 API 響應格式
// 以 ~shared 別名引用，例如：import type { ApiResponse } from '~shared/types/api';

/** 三語系訊息 */
export interface I18nMessage {
  zh_tw: string;
  en: string;
  ja: string;
}

/** 統一 API 響應格式（與 .claude/knowledge/backend-conventions.md 一致） */
export interface ApiResponse<T = unknown> {
  /** 資料主體 */
  data: T;
  /** 狀態 */
  status: {
    /** 狀態碼（200 成功，對應 $enum.apiStatus） */
    code: number;
    /** 三語系訊息 */
    message: I18nMessage;
  };
}
