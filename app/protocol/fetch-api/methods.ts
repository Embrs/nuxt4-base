// 登出
const SignOut = () => {
  // TODO
  navigateTo('/sign-in');
  // const localePath = useLocalePath(); // 語系路徑
  // setTimeout(() => {
  //   navigateTo(localePath('/sign-in'));
  // }, 1000);
};

// 回傳調整
const FilterRes = (response: any, errCode = 9999, _showErr = true) => {
  const r = response?._data;
  const _res = { data: {}, status: { code: errCode, message: { zh_tw: '', en: '', ja: '' } } };
  if (r?.data) _res.data = r?.data;
  if (r?.status) _res.status = r?.status;
  if (_showErr /** code !==0 */) {
    // TODO show error
  }
  return _res as ApiRes<any>;
};

// 預設請求
const Fetch = <T>(url: string, option: AnyObject, _showErr = true): Promise<ApiRes<T>> => {
  try {
    const storeSelf = StoreSelf();
    // const { apiBase } = useRuntimeConfig();
    // const baseURL = import.meta.server ? apiBase : '';
    return $fetch(
      `${url}?t=${Date.now()}`, // 加入 [?t] 避免 api 快取
      {
        // 參數
        ...option,

        // 請求攔截器
        onRequest ({ options }) {
          // options.baseURL = baseURL;
          options.headers = new Headers(options.headers);
          options.headers.set('Authorization', `Bearer ${storeSelf.apiToken}`);
        },

        // 響應攔截
        onResponse ({ response }) {
          const _res = FilterRes(response, 9997, _showErr);

          // TODO 確認登出情境
          // SignOut();
          return Promise.reject(_res);
        },

        // 錯誤處理
        onResponseError ({ response }) {
          const _res = FilterRes(response, 9998, _showErr);
          return Promise.reject(_res);
        }
      }
    );
  } catch (_err) {
    const _res = FilterRes({}, 9999, _showErr);
    return Promise.reject(_res);
  }
};

// -----------------------------------------------------------------------------------------------
// 自動導出
export default {
  /** 取得  */
  get: <T>(url: string, query: AnyObject = {}, _showErr = true) =>
    Fetch<T>(url, { method: 'get', query }, _showErr).catch((err) => err),

  /** 建立 */
  post: <T>(url: string, body: AnyObject = {}, _showErr = true) =>
    Fetch<T>(url, { method: 'post', body }, _showErr).catch((err) => err),

  /** 局部更新 */
  patch: <T>(url: string, body: AnyObject = {}, _showErr = true) =>
    Fetch<T>(url, { method: 'patch', body }, _showErr).catch((err) => err),

  /** 更新 */
  put: <T>(url: string, body: AnyObject = {}, _showErr = true) =>
    Fetch<T>(url, { method: 'put', body }, _showErr).catch((err) => err),

  /** 刪除 */
  delete: <T>(url: string, query: AnyObject = {}, _showErr = true) =>
    Fetch<T>(url, { method: 'delete', query }, _showErr).catch((err) => err),

  /** 檔案上傳 */
  fileUpload: <T>(url: string, body: AnyObject = {}, _showErr = true) =>
    Fetch<T>(url, { method: 'post', body: $tool.JsonToFormData(body) }, _showErr).catch((err) => err),

  /** 檔案下載 */
  fileDownload: <T>(url: string, body: AnyObject = {}, _showErr = true) =>
    Fetch<T>(url, { method: 'get', body: $tool.JsonToFormData(body) }, _showErr).catch((err) => err),

  /** 檔案上傳(進度條) */
  xhrFileUpload: <T>(url: string, body: AnyObject = {}, progressObj: FileProgress, _showErr = true): Promise<ApiRes<T>> => {
    try {
      const storeSelf = StoreSelf();
      return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable && e.total > 0) progressObj['upload'] = Math.floor((e.loaded / e.total) * 100);
        });
        xhr.addEventListener('progress', (e) => {
          if (e.lengthComputable && e.total > 0) progressObj['download'] = Math.floor((e.loaded / e.total) * 100);
        });
        xhr.addEventListener('loadend', (e: any) => {
          let _res: ApiRes<T> = JSON.parse(e?.currentTarget?.responseText || '') || {};
          _res = FilterRes({ _data: _res }, 9996, _showErr);
          resolve(_res);
        });
        xhr.open('POST', url, true);
        xhr.setRequestHeader('Authorization', `Bearer ${storeSelf.apiToken}`);
        xhr.send($tool.JsonToFormData(body));
      });
    } catch (_err) {
      const _res = FilterRes({}, 9999, _showErr);
      return Promise.reject(_res);
    }
  }
};
