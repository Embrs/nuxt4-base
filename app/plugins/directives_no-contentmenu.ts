// 阻止右鍵 v-no-contentmenu
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('no-contentmenu', {
    mounted(el, binding) {
      // 把 handler 存在元素上，方便卸載時移除
      const _Handler = (e: MouseEvent) => {
        if (binding.value === false) return;
        e.preventDefault();
      };
      (el as any)._noContextmenuHandler = _Handler;
  
      el.addEventListener('contextmenu', _Handler);
    },

    beforeUnmount(el) {
      const _Handler = (el as any)._noContextmenuHandler;
      if (_Handler) {
        el.removeEventListener('contextmenu', _Handler);
        delete (el as any)._noContextmenuHandler;
      }
    },
  });
});