
// -----------------------------------------------------------------------------------------------
export default defineNuxtRouteMiddleware((to, from) => {
  if (import.meta.client) {
    const storeDemo = StoreDemo();
    console.log('aa', storeDemo.aa); // 這裡能拿到 localStorage 的值
  }
});