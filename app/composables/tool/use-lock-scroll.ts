// 背景捲動鎖定（自訂彈層用；以模組級計數管理，多開時不會提早解鎖）
// 宣告 const $lock = UseLockScroll();

let lockCount = 0;
let prevOverflow = '';

export const UseLockScroll = () => {
  // 鎖定 body 捲動
  const Lock = () => {
    if (!import.meta.client) return;
    if (lockCount === 0) {
      prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    lockCount++;
  };

  // 解除鎖定（全部彈層關閉後才還原）
  const Unlock = () => {
    if (!import.meta.client) return;
    if (lockCount === 0) return;
    lockCount--;
    if (lockCount === 0) document.body.style.overflow = prevOverflow;
  };

  return {
    /** 鎖定 */
    Lock,
    /** 解除鎖定 */
    Unlock
  };
};
