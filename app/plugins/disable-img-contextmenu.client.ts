// 阻止圖片下載選單
export default defineNuxtPlugin(() => {
  document.addEventListener('contextmenu', (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target && target.tagName.toLowerCase() === 'img') {
      e.preventDefault();
    }
  });
});
