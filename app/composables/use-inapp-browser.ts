// 偵測是否為各大 App 內建瀏覽器（WebView）
// 參考常見 UA 標記：Facebook/Instagram/LINE/WeChat/QQ/TikTok/Twitter/Telegram 等
// 並加入 Android WebView 與 iOS UIWebView/WKWebView 常見特徵
import { ref, computed, onMounted } from 'vue';

export const UseInAppBrowser = () => {
  /** 是否為 App 內建瀏覽器 */
  const isInApp = ref(false);
  /** User Agent */
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';

  /** Android 平台 */
  const isAndroid = computed(() => /Android/i.test(ua));
  /** iOS 平台 */
  const isIOS = computed(() => /iPhone|iPad|iPod/i.test(ua));

  // 常見 App WebView UA 特徵
  // - Facebook: FBAN|FBAV|FB_IAB
  // - Instagram: Instagram
  // - LINE: Line or LINE
  // - WeChat: MicroMessenger
  // - QQ: QQ/
  // - TikTok/抖音: Aweme|TikTok
  // - Twitter: Twitter
  // - Telegram: Telegram
  // - Android WebView: ; wv) 或 Version/\d+ Chrome/\d+ Mobile Safari/\d+
  // - iOS WebView: (iPhone|iPad).+AppleWebKit(?!.*Safari) 或內嵌 App 不帶 Safari 字樣
  const inAppRegex = /(FBAN|FBAV|FB_IAB|Instagram|Line|LINE|MicroMessenger|QQ\/|Aweme|TikTok|Twitter|Telegram)/i;

  /** Android WebView UA 特徵 */
  const isAndroidWebViewRegex = /; wv\)|Version\/\d+\.\d+ Chrome\/\d+ Mobile Safari\//i;
  /** iOS WebView UA 特徵 */
  const isiOSWebViewRegex = /(iPhone|iPad|iPod).+AppleWebKit(?!.*Safari)/i;

  onMounted(() => {
    try {
      const lowerUA = ua || '';
      const matchInApp = inAppRegex.test(lowerUA);
      const matchAndroidWV = isAndroid.value && isAndroidWebViewRegex.test(lowerUA);
      const matchIOSWV = isIOS.value && isiOSWebViewRegex.test(lowerUA);

      // 綜合條件：明確的 App UA 或推測為 WebView
      isInApp.value = Boolean(matchInApp || matchAndroidWV || matchIOSWV);
    } catch (err) {
      isInApp.value = false;
    }
  });

  // 嘗試以外部預設瀏覽器開啟（最佳努力，並非各家 App 都可行）
  const TryOpenInDefaultBrowser = () => {
    if (typeof window === 'undefined') return;
    const url = window.location.href;

    // Android：嘗試使用 intent 協議喚起 Chrome
    if (isAndroid.value) {
      try {
        const loc = new URL(url);
        const intentUrl = `intent://${loc.host}${loc.pathname}${loc.search}${loc.hash}#Intent;scheme=${loc.protocol.replace(':', '')};package=com.android.chrome;end`;
        window.location.href = intentUrl;
        return;
      } catch (e) {
        // ignore
      }
      // 回退方案：提示使用右上角的「在瀏覽器開啟」
      alert('請使用右上角功能選單，選擇「在瀏覽器中開啟」。');
      return;
    }

    // iOS：嘗試使用 googlechrome 協議（需裝有 Chrome）
    if (isIOS.value) {
      try {
        const chromeUrl = 'googlechrome://' + url.replace(/^https?:\/\//, '');
        window.location.href = chromeUrl;
        // 若未安裝 Chrome，通常不會成功，回退提示
        setTimeout(() => {
          alert('若無法開啟，請使用分享鈕，選擇「在瀏覽器中開啟」。');
        }, 800);
        return;
      } catch (e) {
        // ignore
      }
      alert('請使用分享鈕，選擇「在瀏覽器中開啟」。');
      return;
    }

    // 其他平台：嘗試新視窗
    const win = window.open(url, '_blank');
    if (!win) {
      alert('請允許彈出視窗，或手動複製網址在瀏覽器開啟。');
    }
  };

  const CopyUrl = async () => {
    if (typeof window === 'undefined') return false;
    const text = window.location.href;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (e) {
      // ignore and fallback
    }
    try {
      const input = document.createElement('textarea');
      input.value = text;
      input.style.position = 'fixed';
      input.style.top = '-1000px';
      document.body.appendChild(input);
      input.focus();
      input.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(input);
      return ok;
    } catch (e) {
      return false;
    }
  };

  return {
    isInApp,
    isAndroid,
    isIOS,
    TryOpenInDefaultBrowser,
    CopyUrl
  };
};
