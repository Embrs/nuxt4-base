// 登入與權限
// const sevenDay = 60 * 60 * 24 * 7;
export const StoreSelf = defineStore('StoreSelf', () => {
  /** API Token */
  const apiToken = UseEncryptCookie<string>('ss_t', '');

  /** 是否登入 */
  const isSignIn = computed(() => !! apiToken.value);

  /** 設定 Token */
  const SetToken = (_token = '') => {
    apiToken.value = _token;
  };

  /* 個人資料清除 */
  const ClearInfo = () => {
    // 清除 token`
    SetToken('');
  };

  // -----------------------------------------------------------------------------------------------
  return {
    /** 是否登入 */
    isSignIn,
    /** 設定 Token */
    SetToken,
    /** 個人資料清除 */
    ClearInfo,
  };
});
