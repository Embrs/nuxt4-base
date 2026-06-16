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

/** 關閉指定名稱 組件 */
const CloseName = (name: OpenComponent | OpenComponent[]) => {
  const nameList = Array.isArray(name) ? name : [name];
  const storeOpen = StoreOpen();
  storeOpen.openList.forEach((item) => {
    if (nameList.includes(item.componentName)) {
      storeOpen.OnClose(item.uuid);
    }
  });
};

/** 關閉所有組件 */
const CloseAll = () => {
  const storeOpen = StoreOpen();
  storeOpen.openList.forEach((item) => {
    storeOpen.OnClose(item.uuid);
  });
};

/** 關閉指定組件 */
const Close = (uuid: string | string[]) => {
  const uuidList = Array.isArray(uuid) ? uuid : [uuid];
  const storeOpen = StoreOpen();
  storeOpen.openList.forEach((item) => {
    if (uuidList.includes(item.uuid)) {
      storeOpen.OnClose(item.uuid);
    }
  });
};

// -----------------------------------------------------------------------------------------------
export default {
  /** 關閉 */
  Close,
  /** 關閉所有 */
  CloseAll,
  /** 關閉指定名稱 組件 */
  CloseName,
  // -----------------------------------------------------------------------------------------------
  /** 範例：開啟資訊抽屜（Drawer 範本） */
  DrawerExampleInfo: (id: number = 0) => Open('OpenDrawerExampleInfo', { id }),
  /** 範例：開啟編輯彈窗（Dialog 範本，await 可取得回傳結果） */
  DialogExampleEdit: (id: number = 0) => Open<{ id: number; name: string } | false>('OpenDialogExampleEdit', { id })
};
