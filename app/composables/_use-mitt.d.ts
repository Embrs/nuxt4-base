/** mitt 事件 */
type MittEvent = {
  // TODO 追加自定義
  'def-refresh': any   // 刷新數據
  'def-reload': any    // 重加载
};

/** mitt 事件鍵 */
type MittKeys = keyof MittEvent;
