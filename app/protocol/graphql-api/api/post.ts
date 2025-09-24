// 貼文相關 GraphQL 範例 API
// - 與 user.ts 一致的寫法，提供 Query 與 Mutation 範例

import gql from '../methods';

/** 貼文基本欄位 */
interface Post {
  id: string
  title: string
  content?: string
  authorId?: string
}

/** 1. 依 ID 取得貼文 */
export const getPostById = (vars: { id: string }, options?: GqlOptions) => {
  const query = /* GraphQL */ `
    query GetPostById($id: ID!) {
      post(id: $id) {
        id
        title
        content
        authorId
      }
    }
  `;
  return gql.query<{ post: Post | null }>(query, vars, options);
};

/** 2. 取得貼文列表（含分頁示意） */
export const listPosts = (vars: { page?: number; pageSize?: number } = {}, options?: GqlOptions) => {
  const query = /* GraphQL */ `
    query ListPosts($page: Int, $pageSize: Int) {
      posts(page: $page, pageSize: $pageSize) {
        items { id title content authorId }
        total
        page
        pageSize
      }
    }
  `;
  type Res = {
    posts: {
      items: Post[]
      total: number
      page: number
      pageSize: number
    }
  }
  return gql.query<Res>(query, vars, options);
};

/** 3. 建立貼文（Mutation 範例） */
export const createPost = (vars: { input: { title: string; content?: string } }, options?: GqlOptions) => {
  const mutation = /* GraphQL */ `
    mutation CreatePost($input: CreatePostInput!) {
      createPost(input: $input) {
        id
        title
        content
        authorId
      }
    }
  `;
  return gql.mutate<{ createPost: Post }>(mutation, vars, options);
};

/** 4. 更新貼文（Mutation 範例） */
export const updatePost = (vars: { id: string; input: { title?: string; content?: string } }, options?: GqlOptions) => {
  const mutation = /* GraphQL */ `
    mutation UpdatePost($id: ID!, $input: UpdatePostInput!) {
      updatePost(id: $id, input: $input) {
        id
        title
        content
        authorId
      }
    }
  `;
  return gql.mutate<{ updatePost: Post }>(mutation, vars, options);
};

/** 5. 刪除貼文（回傳刪除成功與否） */
export const deletePost = (vars: { id: string }, options?: GqlOptions) => {
  const mutation = /* GraphQL */ `
    mutation DeletePost($id: ID!) {
      deletePost(id: $id)
    }
  `;
  return gql.mutate<{ deletePost: boolean }>(mutation, vars, options);
};
