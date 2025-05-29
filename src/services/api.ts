import {
  LoginResponse,
  SignupRequest,
  SocialLoginResponse,
} from '@/types/auth';
import {
  Comment,
  PostCardProps,
  PostResponse,
  PostDetail,
  PostLike,
} from '@/types/post';
import { useAuthStore } from '@/store/auth';
import {
  MyPageInfo,
  MyPageModify,
  MyPostsResponse,
  NicknameValidationRequest,
  NicknameValidationResponse,
  ProfileImageUpload,
  UpdateNickname,
  UpdatePassword,
  UpdateUserInfo,
} from '@/types/my_page';
import {
  Notification,
  NotificationDetailResponse,
  MarkSelectedReadRequest,
  UnreadCountResponse,
} from '@/types/notification';
import { ChallengeApiResponse } from '@/types/challenge';

import { SearchParams } from '@/types/search';
import { Rank } from '@/types/rank';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const API_BASE_URL_PUBLIC = process.env.NEXT_PUBLIC_API_URL_PUBLIC;

// API 요청 helper 함수
export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const authStore = useAuthStore.getState();

  try {
    // 첫 번째 시도
    const response = await fetchWithAuth(url, options);

    // 토큰이 만료되었다면 (401 에러)
    if (response.status === 401) {
      // 토큰 재발급 시도
      const isReissued = await authStore.reissueToken();

      if (isReissued) {
        const retryResponse = await fetchWithAuth(url, options);
        return handleResponse(retryResponse);
      } else {
        // 여기서는 에러를 던지지 않고, 로그인 페이지로 리다이렉트됨
        const error = new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
        (error as any).status = 401;
        return Promise.reject(error);
      }
    }

    return handleResponse(response);
  } catch (error) {
    // 에러 처리를 통합

    // 인증 관련 에러인 경우 로그인 페이지로 리다이렉트
    if (
      error instanceof Error &&
      (error.message.includes('인증') || error.message.includes('로그인'))
    ) {
      window.location.href = '/';
    }

    throw error;
  }
}

// 인증 토큰을 포함한 fetch 함수
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const authStore = useAuthStore.getState();
  const accessToken = authStore.accessToken;

  // headers 병합 순서 변경
  const headers = {
    ...options.headers, // 커스텀 헤더
    ...(accessToken && { Authorization: `Bearer ${accessToken}` }), // 토큰은 항상 마지막에 추가
  };

  const defaultOptions: RequestInit = {
    ...options,
    headers,
  };

  return fetch(url, defaultOptions);
}

// 응답 처리 함수
async function handleResponse(response: Response) {
  const contentType = response.headers.get('content-type');

  let data;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    console.error('API Error Response:', {
      status: response.status,
      data: data,
    });

    // 에러 객체 생성
    const error = new Error('API Error') as any;
    error.status = response.status;
    error.data = data;

    // errorCode가 있는 경우 처리
    if (typeof data === 'object' && data.errorCode) {
      error.code = data.errorCode;
      error.message = data.message || '서버 에러가 발생했습니다.';
    } else {
      error.message =
        typeof data === 'string'
          ? data
          : data.message || '서버 에러가 발생했습니다.';
    }

    throw error;
  }

  return data;
}

// 인증 관련 API 서비스
export const authService = {
  // 로그인
  login: async (email: string, password: string): Promise<LoginResponse> => {
    return fetchApi('/user/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
  },

  // 회원가입
  signup: async (userData: SignupRequest): Promise<LoginResponse> => {
    return fetchApi('/user/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
  },

  // 비밀번호 이메일 인증 전송
  sendPasswordFindEmail: async (email: string) => {
    return fetchApi('/user/password/reset-link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
  },

  // 이메일 중복 확인
  checkEmailDuplicate: async (email: string) => {
    return fetchApi('/user/validation/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
  },

  logout: async () => {
    return fetchApi('/user/logout', {
      method: 'POST',
    });
  },

  // 이메일 인증 전송
  sendVerificationEmail: async (email: string) => {
    return fetchApi('/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
      // credentials: 'include',
    });
  },

  // 이메일 인증 확인
  verifyEmail: async (token: string, email: string) => {
    return fetchApi('/email/verification/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, email }),
      // credentials: 'include',
    });
  },

  // 비밀번호 찾기 이메일 인증 확인
  verifyPasswordFindEmail: async (token: string, email: string) => {
    return fetchApi('/user/password/verify/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, email }),
    });
  },

  // 비밀번호 변경
  resetPassword: async (token: string, newPassword: string) => {
    return fetchApi('/user/password/reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, newPassword }),
    });
  },

  // 닉네임 중복 확인
  checkNicknameDuplicate: async (nickname: string) => {
    return fetchApi('/user/validation/nickname', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nickname }),
    });
  },

  // 카카오 로그인
  kakaoLogin: async (code: string): Promise<SocialLoginResponse> => {
    return fetchApi(`/oauth/login/kakao?code=${code}`, {
      method: 'GET',
    });
  },

  // 구글 로그인
  googleLogin: async (code: string): Promise<SocialLoginResponse> => {
    return fetchApi(`/oauth/login/google?code=${code}`, {
      method: 'GET',
    });
  },

  // 소셜 계정 연동
  linkSocialAccount: async () => {
    return fetchApi(`/oauth/link`, {
      method: 'POST',
    });
  },

  // 소셜 로그인 URL 가져오기
  getSocialLoginUrl: (provider: 'kakao' | 'google') => {
    const KAKAO_CLIENT_ID = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY;
    const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    // 서버의 OAuth2 콜백 URL 형식에 맞게 설정

    const REDIRECT_URI = `http://localhost:3000/oauth/callback/${provider}`;

    const urls = {
      kakao: `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`,
      google: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=email profile`,
    };

    return urls[provider];
  },
};

// 게시글 관련 API 서비스
export const postService = {
  // 게시글 작성
  writePost: async (formData: FormData): Promise<PostResponse> => {
    const options: RequestInit = {
      method: 'POST',
      body: formData,
    };

    return fetchApi('/post', options);
  },

  // 회원: 게시글 상세 조회
  getPostDetail: async (postId: number) => {
    return fetchApi<PostDetail>(`/post/${postId}`, {
      method: 'GET',
    });
  },

  // 회원: 무한 스크롤 게시글 조회
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

    // URL 수정: /api/v1/post?tagExist=true&lastPostId=4&pageSize=15
    return fetchApi<PostCardProps[]>(`/post?${searchParams}`, {
      method: 'GET',
    });
  },

  // 비회원: 무한 스크롤 게시글 조회
  getPublicPosts: async (params: { cursor_id?: number; limit?: number }) => {
    const searchParams = new URLSearchParams({
      ...(params.cursor_id && { cursor_id: params.cursor_id.toString() }),
      limit: (params.limit || 15).toString(),
    });

    const url = `${API_BASE_URL_PUBLIC}/posts/cursor?${searchParams}`;

    const response = await fetch(url, { method: 'GET' });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || '비회원 게시글 목록 조회 중 오류');
    }

    return data as PostCardProps[];
  },

  // 비회원: 게시글 상세 조회
  getPublicPostDetail: async (postId: number) => {
    const url = `${API_BASE_URL_PUBLIC}/posts/${postId}`;

    const response = await fetch(url, { method: 'GET' });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || '비회원 게시글 상세 조회 중 오류');
    }

    return data as PostDetail;
  },

  // 게시글 수정
  updatePost: async (
    postId: number,
    formData: FormData,
  ): Promise<PostResponse> => {
    return fetchApi(`/post/${postId}`, {
      method: 'PUT',
      body: formData,
    });
  },

  // 게시글 삭제
  deletePost: async (postId: number): Promise<void> => {
    return fetchApi(`/post/${postId}`, {
      method: 'DELETE',
    });
  },

  // 게시글 좋아요
  likePost: async (postId: number): Promise<PostLike> => {
    return fetchApi(`/like/post/${postId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  // 게시글 좋아요 취소
  unlikePost: async (postId: number): Promise<PostLike> => {
    return fetchApi(`/unlike/post/${postId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },
};

// 댓글 관련 API 서비스
export const commentService = {
  // 댓글 목록 조회 (무한 스크롤)
  getComments: async (params: {
    postId: number;
    lastCommentId?: number;
    pageSize?: number;
  }): Promise<Comment[]> => {
    const searchParams = new URLSearchParams({
      postId: params.postId.toString(),
      ...(params.lastCommentId && {
        lastCommentId: params.lastCommentId.toString(),
      }),
      pageSize: (params.pageSize || 15).toString(),
    });

    return fetchApi(`/comments?${searchParams}`, {
      method: 'GET',
    });
  },

  // 댓글 작성
  createComment: async (
    postId: number,
    content: string,
    parentCommentId?: number | null,
    userId?: number | null,
  ) => {
    return fetchApi(`/comment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        postId,
        content,
        parentCommentId,
        userId,
      }),
    });
  },

  // 댓글 수정
  updateComment: async (
    commentId: number,
    content: string,
    postId: number,
    userId: number | null,
  ) => {
    return fetchApi(`/comment/${commentId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'PUT',
      body: JSON.stringify({ content, postId, userId }),
    });
  },

  // 댓글 삭제
  deleteComment: async (commentId: number) => {
    return fetchApi(`/comment/${commentId}`, {
      method: 'DELETE',
    });
  },
};

// 검색 관련 API 서비스
export const searchService = {
  getSearchPosts: async (params: SearchParams) => {
    const url = `${API_BASE_URL_PUBLIC}/search/`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        keyword_text: params.keyword_text || '',
        keyword_user: params.keyword_user || '',
        mbti: params.mbti ?? [],
        hobby_tags: params.hobby_tags ?? [],
        cursor_created_at: params.cursor_created_at ?? null,
        cursor_id: params.cursor_id ?? null,
        limit: params.limit ?? 15,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || '검색 중 오류 ');
    }

    return await response.json();
  },
};

// 마이페이지 관련 API 서비스
export const userService = {
  // 마이페이지 정보 조회
  getMyPageInfo: async (): Promise<MyPageInfo> => {
    return fetchApi<MyPageInfo>('/my-page', {
      method: 'GET',
    });
  },

  // 내 게시글 목록 조회
  getMyPosts: async (
    lastPostId?: number,
    pageSize: number = 15,
  ): Promise<MyPostsResponse> => {
    const params = new URLSearchParams();
    if (lastPostId) params.append('lastPostId', lastPostId.toString());
    params.append('pageSize', pageSize.toString());

    return fetchApi<MyPostsResponse>(`/my-page/myposts?${params}`, {
      method: 'GET',
    });
  },

  // 개인정보 수정 페이지 데이터 조회
  getMyModifyPage: async (): Promise<MyPageModify> => {
    return fetchApi<MyPageModify>('/my-page/my-modify-page', {
      method: 'GET',
    });
  },

  // 닉네임 중복 확인
  validateNickname: async (
    body: NicknameValidationRequest,
  ): Promise<NicknameValidationResponse> => {
    return fetchApi<NicknameValidationResponse>(
      '/my-page/validation/nickname',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    );
  },

  // 닉네임 변경
  updateNickname: async (body: UpdateNickname): Promise<void> => {
    return fetchApi<void>('/my-page/update/nickname', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  },

  // 현재 비밀번호 확인
  checkCurrentPassword: async (
    currentPassword: string,
  ): Promise<{ check: boolean }> => {
    const response = await fetchApi<{ check: boolean }>(
      '/my-page/update/password/check',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword }),
      },
    );

    return response;
  },

  // 비밀번호 변경
  updatePassword: async (body: UpdatePassword): Promise<void> => {
    return fetchApi<void>('/my-page/update/password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  },

  // 프로필 이미지 업로드
  uploadProfileImage: async (
    profileImage: File,
  ): Promise<ProfileImageUpload> => {
    const formData = new FormData();
    formData.append('profileImage', profileImage);

    return fetchApi<ProfileImageUpload>('/my-page/update/profile-image', {
      method: 'POST',
      body: formData,
    });
  },

  // 개인정보 수정 저장
  updateUserInfo: async (body: UpdateUserInfo): Promise<void> => {
    return fetchApi<void>('/my-page/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  },

  // 회원 탈퇴
  deleteUser: async (reason: string): Promise<{ message: string }> => {
    return fetchApi('/user/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });
  },

  // 등급 조회
  getUserRank: async (): Promise<Rank> => {
    return fetchApi<Rank>('/user-rank/me', {
      method: 'GET',
    });
  },

  // 유저 레벨 조회
  getUserLevel: async (): Promise<number> => {
    return fetchApi<number>('/user-rank/level', {
      method: 'GET',
    });
  },

  //소셜 로그인 연동 정보
  getLoginStatus: async (): Promise<{ kakao: boolean; google: boolean }> => {
    return fetchApi('/oauth/status', {
      method: 'GET',
    });
  },
};

// 알림 관련 API 서비스
export const notificationService = {
  // 알림 리스트 조회
  getNotifications: async (
    lastNotificationId?: number,
    pageSize: number = 15,
  ): Promise<Notification[]> => {
    const params = new URLSearchParams({
      pageSize: pageSize.toString(),
      ...(lastNotificationId && {
        lastNotificationId: lastNotificationId.toString(),
      }),
    });

    return fetchApi<Notification[]>(`/notifications?${params}`, {
      method: 'GET',
    });
  },

  // 알림 상세 조회 및 삭제
  getNotificationDetail: async (
    notificationId: number,
  ): Promise<NotificationDetailResponse> => {
    return fetchApi<NotificationDetailResponse>(
      `/notifications/${notificationId}`,
      {
        method: 'POST',
      },
    );
  },

  // 전체 읽음 처리
  markAllRead: async (): Promise<void> => {
    return fetchApi<void>(`/notifications/read-all`, {
      method: 'POST',
    });
  },

  // 선택 알림 읽음 처리
  markSelectedRead: async (notificationIds: number[]): Promise<void> => {
    const body: MarkSelectedReadRequest = { notificationIds };

    return fetchApi<void>(`/notifications/read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  },

  // 읽지 않은 알림 개수 조회
  getUnreadCount: async (): Promise<UnreadCountResponse> => {
    return fetchApi<UnreadCountResponse>(`/notifications/unread-count`, {
      method: 'GET',
    });
  },
};

// 챌린지 관련 API 서비스
export const challengeService = {
  // 챌린지 시작
  startChallenge: async (challengeNumber: number): Promise<void> => {
    return fetchApi(`/challenge/start/${challengeNumber}`, {
      method: 'POST',
    });
  },

  // 챌린지 조회
  getChallenges: async (): Promise<ChallengeApiResponse> => {
    return fetchApi('/challenge', {
      method: 'GET',
    });
  },
};
