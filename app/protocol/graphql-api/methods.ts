// GraphQL 請求核心封裝
// - 與 fetch-api 類似：統一在這裡處理 token/攔截器/錯誤轉換
// - 暴露 query<T>() / mutate<T>() 兩個方法，回傳 GqlRes<T>

// 將 GraphQL 原生回傳轉為專案統一格式
const ToGqlRes = <T>(raw: GqlRawResponse<T> | undefined, errCode = 0, _showErr = true): GqlRes<T> => {
  const firstErr = raw?.errors?.[0];
  const isError = !!firstErr;
  const data = (raw?.data as T) || ({} as T);

  const status = {
    code: isError ? (errCode || 1) : 0,
    message: {
      zh_tw: isError ? (firstErr?.message || '發生未知錯誤') : '',
      en: isError ? (firstErr?.message || 'Unknown error') : '',
      ja: isError ? (firstErr?.message || '不明なエラーが発生しました') : ''
    }
  } as GqlRes['status'];

  if (isError && _showErr) {
    // TODO: 可在此接入全域錯誤提示（例如 ElMessage、Modal 等）
  }

  return { data, status } as GqlRes<T>;
};

// 共用請求方法：透過 $fetch 呼叫 GraphQL endpoint
const GqlFetch = async <T>(payload: GqlRequest, options: GqlOptions = {}): Promise<GqlRes<T>> => {
  const endpoint = options.endpoint || '/graphql';
  const showError = options.showError ?? true;

  try {
    const storeSelf = StoreSelf();

    return await $fetch(endpoint, {
      method: 'POST',
      body: payload,

      // 請求攔截器
      onRequest({ options }) {
        options.headers = new Headers(options.headers);
        options.headers.set('Content-Type', 'application/json');
        options.headers.set('Authorization', `Bearer ${storeSelf.apiToken}`);
      },

      // 響應攔截（包含 GraphQL 層級錯誤）
      onResponse({ response }) {
        const raw = response?._data as GqlRawResponse<T> | undefined;
        const _res = ToGqlRes<T>(raw, 1, showError);
        // 與 fetch-api 保持一致：在攔截器中將結果 reject 出去
        return Promise.reject(_res);
      },

      // 網路錯誤或非 2xx
      onResponseError({ response }) {
        const raw = response?._data as GqlRawResponse<T> | undefined;
        const _res = ToGqlRes<T>(raw, 9998, showError);
        return Promise.reject(_res);
      }
    });
  } catch (_err) {
    const _res = ToGqlRes<T>(undefined, 9999, showError);
    return Promise.reject(_res);
  }
};

export default {
  /** GraphQL 查詢（Query） */
  query: async <T>(query: string, variables: AnyObject = {}, options: GqlOptions = {}): Promise<GqlRes<T>> =>
    GqlFetch<T>({ query, variables }, options).catch((err) => err),

  /** GraphQL 變更（Mutation） */
  mutate: async <T>(query: string, variables: AnyObject = {}, options: GqlOptions = {}): Promise<GqlRes<T>> =>
    GqlFetch<T>({ query, variables }, options).catch((err) => err)
};
