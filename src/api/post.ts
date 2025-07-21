import {
  PostCardProps,
  PostDetail,
  PostLike,
  PostResponse,
} from '@/types/post';
import { request } from './request';

export const postApi = {
  writePost: async (formData: FormData) => {
    return request<PostResponse>({
      url: '/post',
      method: 'POST',
      data: formData,
    });
  },
  getPostDetail: async (postId: number) => {
    return request<PostDetail>({
      url: `/post/${postId}`,
      method: 'GET',
    });
  },
  getInfiniteScrollPosts: async (params: {
    tagExist: boolean;
    lastPostId?: number;
    pageSize: number;
  }) => {
    const searchParams = new URLSearchParams({
      tagExist: params.tagExist.toString(),
      ...(params.lastPostId && { lastPostId: params.lastPostId.toString() }),
      pageSize: (params.pageSize || 15).toString(),
    });
    return request<PostCardProps[]>({
      url: `/post?${searchParams}`,
      method: 'GET',
    });
  },
  getPublicPosts: async (params: { cursor_id?: number; limit?: number }) => {
    const searchParams = new URLSearchParams({
      ...(params.cursor_id && { cursor_id: params.cursor_id.toString() }),
      limit: (params.limit || 15).toString(),
    });
    return request<PostCardProps[]>({
      url: `/posts/cursor?${searchParams}`,
      method: 'GET',
    });
  },
  getPublicPostDetail: async (postId: number) => {
    return request<PostDetail>({
      url: `/posts/${postId}`,
      method: 'GET',
    });
  },
  updatePost: async (postId: number, formData: FormData) => {
    return request<PostResponse>({
      url: `/post/${postId}`,
      method: 'PUT',
      data: formData,
    });
  },
  deletePost: async (postId: number) => {
    return request<void>({
      url: `/post/${postId}`,
      method: 'DELETE',
    });
  },
  likePost: async (postId: number) => {
    return request<PostLike>({
      url: `/like/post/${postId}`,
      method: 'POST',
    });
  },
  unlikePost: async (postId: number) => {
    return request<PostLike>({
      url: `/unlike/post/${postId}`,
      method: 'POST',
    });
  },
};
