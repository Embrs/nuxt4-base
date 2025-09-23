/** 插入開啟組件（不用動） */
const Open = <T>(componentName: OpenComponent, params: any = {}): Promise<T> => {
  const storeOpen = StoreOpen();
  return new Promise<T>((resolve) => {
    storeOpen.OnOpen<T>({ 
      uuid: `open-${$tool.CreateUUID()}`,  // uuid
      componentName, // 組件
      params, // 參數
      resolve // 回傳
    });
  });
};

const CloseName = (name: OpenComponent | OpenComponent[]) => {
  const nameList = Array.isArray(name) ? name : [name];
  StoreOpen().openList.forEach((item) => {
    if (nameList.includes(item.componentName)) {
      StoreOpen().OnClose(item.uuid);
    }
  });
};

// -----------------------------------------------------------------------------------------------
export default {
  /** 關閉 */
  Close: (uuid: string | string[]) => StoreOpen().OnClose(uuid),
  /** 關閉所有 */
  CloseAll: () => StoreOpen().OnCloseAll(),
  /** 關閉指定名稱 組件 */
  CloseName: (name: OpenComponent | OpenComponent[]) => CloseName(name),
  // -----------------------------------------------------------------------------------------------
  /** 開啟測試 */
  DialogDemo: (params: DialogDemoParams) => Open('OpenDialogDemo', params),
  /** 開啟測試 抽屜 */
  DrawerDemoInfo: () => Open('OpenDrawerDemoInfo'),
  /** 影片錄製 */
  DialogVideoRecording: () => Open<File>('OpenDialogVideoRecording'),
  /** 圖片選擇 */
  DialogImageEdit: () => Open<File>('OpenDialogImageSelect')
  // TODO 組件加完後，要設定
};
