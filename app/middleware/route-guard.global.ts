// 全域路由守衛：每次路由切換時執行。
// 範例用途：登入驗證、權限檢查、未授權導向登入頁。
// -----------------------------------------------------------------------------------------------
export default defineNuxtRouteMiddleware(() => {
  // 範例：未登入則導向登入頁
  // const storeSelf = StoreSelf();
  // if (!storeSelf.token && useRoute().path !== '/login') return navigateTo('/login');
});
