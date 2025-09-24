// GraphQL API 總匯出
// - 匯整 ./api 目錄的各模組
// - 使用方式：
//   import gqlApi from '@/app/protocol/graphql-api'
//   const res = await gqlApi.getUserById({ id: '1' })
//   const res2 = await gqlApi.createPost({ input: { title: 'Hello', content: 'World' } })

import * as user from './api/user';
import * as post from './api/post';

export default {
  ...user,
  ...post
};

// // 若想自動聚合，可改用 Vite 的 import.meta.glob 策略（與 fetch-api 同構理念）
// // const modules = import.meta.glob('./api/**/index.ts', { eager: true }) as Record<string, any>
// // const apiExports: Record<string, any> = {}
// // for (const key in modules) {
// //   const mod = modules[key] as Record<string, any>
// //   Object.assign(apiExports, mod)
// // }
// // export default apiExports
