/** 插入開啟組件（不用動） */
const Open = <T>(componentName: OpenComponent, params: any): Promise<T> => {
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

// -----------------------------------------------------------------------------------------------
export default {
  /** 開啟測試 */
  DialogDemo: (params: DialogDemoParams) => Open('OpenDialogDemo', params)
  // TODO 組件加完後，要設定
};
