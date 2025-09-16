const Open = <T>(component: string, params: any): Promise<T> =>{
  const storeOpen = StoreOpen();

  return new Promise<T>((resolve) => {
    storeOpen.OnOpen({ 
      uuid: `open-${$tool.CreateUUID()}`,  // uuid
      component, // 組件
      params, // 參數
      resolve // 回傳
    });
  });
};

export default {
  /** 開啟測試 */
  OpenDialogDemo: (params: OpenDialogDemo) => Open('OpenDialogDemo', params)
};
