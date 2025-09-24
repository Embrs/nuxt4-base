// 使用者相關 GraphQL 範例 API
// - 封裝 query/mutate，回傳型別為 GqlRes<T>
// - 你可以依實際 schema 調整欄位

import gql from '../methods';

/** 使用者基本欄位 */
interface User {
  id: string
  name: string
  email?: string
}

/** 1. 依 ID 取得使用者 */
export const getUserById = (vars: { id: string }, options?: GqlOptions) => {
  const query = /* GraphQL */ `
    query GetUserById($id: ID!) {
      user(id: $id) {
        id
        name
        email
      }
    }
  `;
  return gql.query<{ user: User | null }>(query, vars, options);
};

/** 2. 取得使用者列表（含分頁示意） */
export const listUsers = (vars: { page?: number; pageSize?: number } = {}, options?: GqlOptions) => {
  const query = /* GraphQL */ `
    query ListUsers($page: Int, $pageSize: Int) {
      users(page: $page, pageSize: $pageSize) {
        items { id name email }
        total
        page
        pageSize
      }
    }
  `;
  type Res = {
    users: {
      items: User[]
      total: number
      page: number
      pageSize: number
    }
  }
  return gql.query<Res>(query, vars, options);
};

/** 3. 建立使用者（Mutation 範例） */
export const createUser = (vars: { input: { name: string; email?: string } }, options?: GqlOptions) => {
  const mutation = /* GraphQL */ `
    mutation CreateUser($input: CreateUserInput!) {
      createUser(input: $input) {
        id
        name
        email
      }
    }
  `;
  return gql.mutate<{ createUser: User }>(mutation, vars, options);
};

/** 4. 更新使用者名稱（局部更新示意） */
export const updateUserName = (vars: { id: string; name: string }, options?: GqlOptions) => {
  const mutation = /* GraphQL */ `
    mutation UpdateUserName($id: ID!, $name: String!) {
      updateUserName(id: $id, name: $name) {
        id
        name
        email
      }
    }
  `;
  return gql.mutate<{ updateUserName: User }>(mutation, vars, options);
};

/** 5. 刪除使用者（回傳刪除成功與否） */
export const deleteUser = (vars: { id: string }, options?: GqlOptions) => {
  const mutation = /* GraphQL */ `
    mutation DeleteUser($id: ID!) {
      deleteUser(id: $id)
    }
  `;
  return gql.mutate<{ deleteUser: boolean }>(mutation, vars, options);
};
