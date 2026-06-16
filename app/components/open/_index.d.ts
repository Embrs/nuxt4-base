// 組件群 -----------------------------------------------------------------------------------------------
// 新增業務彈窗時，在此聯集補上組件名（PascalCase，對應 components/open 下的檔案路徑）
type OpenComponent =
  'OpenDrawerExampleInfo'

// 參數群 -----------------------------------------------------------------------------------------------
// 對應各彈窗的 params 型別，依需求收斂（例：DrawerExampleInfoParams | DialogXxxParams）
type OpenParams = Record<string, any>
