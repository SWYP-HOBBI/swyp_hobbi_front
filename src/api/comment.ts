import { Comment } from '@/types/post';
import { request } from './request';

export const commentApi = {
  getComments: async (params: {
    postId: number;
    lastCommentId?: number;
    pageSize?: number;
  }) => {
    const searchParams = new URLSearchParams({
      postId: params.postId.toString(),
      ...(params.lastCommentId && {
        lastCommentId: params.lastCommentId.toString(),
      }),
      pageSize: (params.pageSize || 15).toString(),
    });
    return request<Comment[]>({
      url: `/comments?${searchParams}`,
      method: 'GET',
    });
  },
  createComment: async (
    postId: number,
    content: string,
    parentCommentId?: number | null,
    userId?: number | null,
  ) => {
    return request<Comment>({
      url: `/comment`,
      method: 'POST',
      data: { postId, content, parentCommentId, userId },
    });
  },
  updateComment: async (
    commentId: number,
    content: string,
    postId: number,
    userId: number | null,
  ) => {
    return request<Comment>({
      url: `/comment/${commentId}`,
      method: 'PUT',
      data: { content, postId, userId },
    });
  },
  deleteComment: async (commentId: number) => {
    return request<void>({
      url: `/comment/${commentId}`,
      method: 'DELETE',
    });
  },
};
