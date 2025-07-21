import {
  MyPageInfo,
  MyPageModify,
  MyPostsResponse,
  NicknameValidationResponse,
  UpdatePassword,
  UpdateUserInfo,
} from '@/types/my_page';
import { request } from './request';
import { Rank } from '@/types/rank';

export const userApi = {
  getMyPageInfo: async () => {
    return request<MyPageInfo>({
      url: '/my-page',
      method: 'GET',
    });
  },
  getMyPosts: async (lastPostId?: number, pageSize: number = 15) => {
    const params = new URLSearchParams();
    if (lastPostId) params.append('lastPostId', lastPostId.toString());
    params.append('pageSize', pageSize.toString());
    return request<MyPostsResponse>({
      url: `/my-page/myposts?${params}`,
      method: 'GET',
    });
  },
  getMyModifyPage: async () => {
    return request<MyPageModify>({
      url: '/my-page/my-modify-page',
      method: 'GET',
    });
  },
  validateNickname: async (nickname: string) => {
    return request<NicknameValidationResponse>({
      url: '/my-page/validation/nickname',
      method: 'POST',
      data: { nickname },
    });
  },

  updateNickname: async (nickname: string) => {
    return request<void>({
      url: '/my-page/update/nickname',
      method: 'PUT',
      data: { nickname },
    });
  },
  checkCurrentPassword: async (currentPassword: string) => {
    return request<{ check: boolean }>({
      url: '/my-page/update/password/check',
      method: 'POST',
      data: { currentPassword },
    });
  },
  updatePassword: async (body: UpdatePassword) => {
    return request<void>({
      url: '/my-page/update/password',
      method: 'PUT',
      data: body,
    });
  },
  uploadProfileImage: async (profileImage: File) => {
    const formData = new FormData();
    formData.append('profileImage', profileImage);
    return request<string>({
      url: '/my-page/update/profile-image',
      method: 'POST',
      data: formData,
    });
  },
  updateUserInfo: async (body: UpdateUserInfo) => {
    return request<void>({
      url: '/my-page/update',
      method: 'POST',
      data: body,
    });
  },
  deleteUser: async (reason: string) => {
    return request<{ message: string }>({
      url: '/user/delete',
      method: 'DELETE',
      data: { reason },
    });
  },
  getUserRank: async () => {
    return request<Rank>({
      url: '/user-rank/me',
      method: 'GET',
    });
  },
  getUserLevel: async () => {
    return request<number>({
      url: '/user-rank/level',
      method: 'GET',
    });
  },
  getLoginStatus: async () => {
    return request<{ kakao: boolean; google: boolean }>({
      url: '/oauth/status',
      method: 'GET',
    });
  },
};
