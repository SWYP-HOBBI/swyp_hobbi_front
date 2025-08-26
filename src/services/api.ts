/**
 * API 서비스 모듈
 *
 * 이 파일은 애플리케이션의 모든 API 통신을 담당하는 중앙 집중식 서비스 모듈입니다.
 * 주요 기능:
 * - 인증 토큰 자동 갱신
 * - 통합된 에러 처리
 * - 타입 안전한 API 호출
 * - 소셜 로그인 OAuth 플로우
 * - 무한 스크롤 지원
 * - 파일 업로드 처리
 */

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

import { SearchPost } from '@/types/search';
import { Rank } from '@/types/rank';

// 환경 변수에서 API URL 가져오기
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL; // 인증이 필요한 API 엔드포인트
const API_BASE_URL_PUBLIC = process.env.NEXT_PUBLIC_API_URL_PUBLIC; // 공개 API 엔드포인트

/**
 * 통합 API 요청 헬퍼 함수
 *
 * 모든 API 호출의 기본이 되는 함수로, 다음 기능을 제공합니다:
 * - 자동 인증 토큰 첨부
 * - 토큰 만료 시 자동 갱신 및 재시도
 * - 통합된 에러 처리
 * - 인증 실패 시 자동 로그인 페이지 리다이렉트
 *
 * @param endpoint - API 엔드포인트 경로 (예: '/user/login')
 * @param options - fetch 옵션 (method, headers, body 등)
 * @returns Promise<T> - API 응답 데이터
 */
export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const authStore = useAuthStore.getState();

  try {
    // 첫 번째 API 요청 시도
    const response = await fetchWithAuth(url, options);

    // 401 에러 (토큰 만료) 발생 시 자동 갱신 시도
    if (response.status === 401) {
      // 토큰 재발급 시도
      const isReissued = await authStore.reissueToken();

      if (isReissued) {
        // 토큰 갱신 성공 시 원래 요청 재시도
        const retryResponse = await fetchWithAuth(url, options);
        return handleResponse(retryResponse);
      } else {
        // 토큰 갱신 실패 시 에러 발생 (로그인 페이지로 리다이렉트됨)
        const error = new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
        (error as any).status = 401;
        return Promise.reject(error);
      }
    }

    return handleResponse(response);
  } catch (error) {
    // 통합 에러 처리
    // 인증 관련 에러인 경우 자동으로 로그인 페이지로 리다이렉트
    if (
      error instanceof Error &&
      (error.message.includes('인증') || error.message.includes('로그인'))
    ) {
      window.location.href = '/';
    }

    throw error;
  }
}

/**
 * 인증 토큰을 자동으로 포함하는 fetch 함수
 *
 * 모든 API 요청에 Authorization 헤더를 자동으로 추가합니다.
 * 커스텀 헤더와 토큰 헤더의 충돌을 방지하기 위해 헤더 병합 순서를 조정합니다.
 *
 * @param url - 요청할 URL
 * @param options - fetch 옵션
 * @returns Promise<Response> - fetch 응답
 */
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const authStore = useAuthStore.getState();
  const accessToken = authStore.accessToken;

  // 헤더 병합 순서: 커스텀 헤더 → 토큰 헤더
  // 이렇게 하면 커스텀 헤더가 토큰 헤더를 덮어쓰지 않습니다
  const headers = {
    ...options.headers, // 사용자가 지정한 커스텀 헤더
    ...(accessToken && { Authorization: `Bearer ${accessToken}` }), // 토큰은 항상 마지막에 추가
  };

  const defaultOptions: RequestInit = {
    ...options,
    headers,
  };

  return fetch(url, defaultOptions);
}

/**
 * API 응답 처리 함수
 *
 * 서버 응답을 적절한 형태로 파싱하고 에러를 처리합니다.
 * JSON과 텍스트 응답을 모두 지원하며, 서버 에러 코드를 클라이언트 에러로 변환합니다.
 *
 * @param response - fetch 응답 객체
 * @returns Promise<any> - 파싱된 응답 데이터
 */
async function handleResponse(response: Response) {
  const contentType = response.headers.get('content-type');

  // Content-Type에 따라 적절한 파싱 방법 선택
  let data;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  // HTTP 상태 코드가 성공이 아닌 경우 에러 처리
  if (!response.ok) {
    console.error('API Error Response:', {
      status: response.status,
      data: data,
    });

    // 에러 객체 생성 및 상세 정보 추가
    const error = new Error('API Error') as any;
    error.status = response.status;
    error.data = data;

    // 서버에서 제공하는 errorCode가 있는 경우 우선 사용
    if (typeof data === 'object' && data.errorCode) {
      error.code = data.errorCode;
      error.message = data.message || '서버 에러가 발생했습니다.';
    } else {
      // errorCode가 없는 경우 기본 메시지 사용
      error.message =
        typeof data === 'string'
          ? data
          : data.message || '서버 에러가 발생했습니다.';
    }

    throw error;
  }

  return data;
}

/**
 * 인증 관련 API 서비스
 *
 * 로그인, 회원가입, 소셜 로그인, 이메일 인증 등 모든 인증 관련 기능을 제공합니다.
 */
export const authService = {
  /**
   * 일반 로그인
   *
   * 이메일과 비밀번호를 사용한 기본 로그인 기능
   * 성공 시 액세스 토큰과 리프레시 토큰을 반환합니다.
   *
   * @param email - 사용자 이메일
   * @param password - 사용자 비밀번호
   * @returns Promise<LoginResponse> - 로그인 응답 (토큰 포함)
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    return fetchApi('/user/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
  },

  /**
   * 회원가입
   *
   * 새로운 사용자 계정을 생성합니다.
   * 회원가입 성공 시 자동으로 로그인 상태가 됩니다.
   *
   * @param userData - 회원가입에 필요한 사용자 정보
   * @returns Promise<LoginResponse> - 회원가입 및 로그인 응답
   */
  signup: async (userData: SignupRequest): Promise<LoginResponse> => {
    return fetchApi('/user/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
  },

  /**
   * 비밀번호 찾기 이메일 전송
   *
   * 사용자가 비밀번호를 잊어버렸을 때 재설정 링크를 이메일로 전송합니다.
   *
   * @param email - 비밀번호를 재설정할 이메일 주소
   */
  sendPasswordFindEmail: async (email: string) => {
    return fetchApi('/user/password/reset-link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
  },

  /**
   * 이메일 중복 확인
   *
   * 회원가입 시 이메일이 이미 사용 중인지 확인합니다.
   *
   * @param email - 확인할 이메일 주소
   */
  checkEmailDuplicate: async (email: string) => {
    return fetchApi('/user/validation/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
  },

  /**
   * 로그아웃
   *
   * 현재 사용자의 세션을 종료하고 토큰을 무효화합니다.
   */
  logout: async () => {
    return fetchApi('/user/logout', {
      method: 'POST',
    });
  },

  /**
   * 이메일 인증 전송
   *
   * 회원가입 후 이메일 인증을 위한 인증 코드를 전송합니다.
   *
   * @param email - 인증 코드를 받을 이메일 주소
   */
  sendVerificationEmail: async (email: string) => {
    return fetchApi('/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
  },

  /**
   * 이메일 인증 확인
   *
   * 사용자가 이메일로 받은 6자리 인증 코드를 확인하여 계정을 활성화합니다.
   *
   * @param code - 이메일로 받은 6자리 인증 코드
   * @param email - 인증할 이메일 주소
   */
  verifyEmail: async (code: string, email: string) => {
    return fetchApi('/email/verification/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, email }),
    });
  },

  /**
   * 비밀번호 찾기 이메일 인증 확인
   *
   * 비밀번호 재설정 이메일의 토큰을 확인합니다.
   *
   * @param token - 비밀번호 재설정 이메일의 토큰
   * @param email - 비밀번호를 재설정할 이메일 주소
   */
  verifyPasswordFindEmail: async (token: string, email: string) => {
    return fetchApi('/user/password/verify/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, email }),
    });
  },

  /**
   * 비밀번호 재설정
   *
   * 비밀번호 찾기 토큰을 사용하여 새로운 비밀번호로 변경합니다.
   *
   * @param token - 비밀번호 재설정 토큰
   * @param newPassword - 새로운 비밀번호
   */
  resetPassword: async (token: string, newPassword: string) => {
    return fetchApi('/user/password/reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, newPassword }),
    });
  },

  /**
   * 닉네임 중복 확인
   *
   * 회원가입 또는 닉네임 변경 시 중복 여부를 확인합니다.
   *
   * @param nickname - 확인할 닉네임
   */
  checkNicknameDuplicate: async (nickname: string) => {
    return fetchApi('/user/validation/nickname', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nickname }),
    });
  },

  /**
   * 카카오 소셜 로그인
   *
   * 카카오 OAuth 인증 코드를 사용하여 로그인합니다.
   *
   * @param code - 카카오 OAuth 인증 코드
   * @returns Promise<SocialLoginResponse> - 소셜 로그인 응답
   */
  kakaoLogin: async (code: string): Promise<SocialLoginResponse> => {
    return fetchApi(`/oauth/login/kakao?code=${code}`, {
      method: 'GET',
    });
  },

  /**
   * 구글 소셜 로그인
   *
   * 구글 OAuth 인증 코드를 사용하여 로그인합니다.
   *
   * @param code - 구글 OAuth 인증 코드
   * @returns Promise<SocialLoginResponse> - 소셜 로그인 응답
   */
  googleLogin: async (code: string): Promise<SocialLoginResponse> => {
    return fetchApi(`/oauth/login/google?code=${code}`, {
      method: 'GET',
    });
  },

  /**
   * 소셜 계정 연동
   *
   * 기존 계정에 소셜 로그인 계정을 추가로 연동합니다.
   */
  linkSocialAccount: async () => {
    return fetchApi(`/oauth/link`, {
      method: 'POST',
    });
  },

  /**
   * 소셜 로그인 URL 생성
   *
   * 카카오 또는 구글 OAuth 인증을 위한 URL을 생성합니다.
   * 환경 변수에서 클라이언트 ID와 리다이렉트 URI를 가져와 OAuth 플로우를 시작합니다.
   *
   * @param provider - 소셜 로그인 제공자 ('kakao' | 'google')
   * @returns string - OAuth 인증 URL
   */
  getSocialLoginUrl: (provider: 'kakao' | 'google') => {
    // 환경 변수에서 OAuth 설정 가져오기
    const KAKAO_CLIENT_ID = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY;
    const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const BASE_URL = process.env.NEXT_PUBLIC_URL;

    // OAuth2 콜백 URL 생성
    // 서버의 OAuth2 콜백 엔드포인트 형식에 맞게 설정
    const REDIRECT_URI = `${BASE_URL}/oauth/callback/${provider}`;

    // 제공자별 OAuth URL 생성
    const urls = {
      kakao: `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`,
      google: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=email profile`,
    };

    return urls[provider];
  },
};

/**
 * 게시글 관련 API 서비스
 *
 * 게시글 작성, 조회, 수정, 삭제, 좋아요 등 모든 게시글 관련 기능을 제공합니다.
 * 회원용과 비회원용 API를 분리하여 제공합니다.
 */
export const postService = {
  /**
   * 게시글 작성
   *
   * 새로운 게시글을 작성합니다. 이미지 파일과 텍스트 내용을 FormData로 전송합니다.
   *
   * @param formData - 게시글 데이터 (이미지, 텍스트, 태그 등)
   * @returns Promise<PostResponse> - 작성된 게시글 정보
   */
  writePost: async (formData: FormData): Promise<PostResponse> => {
    const options: RequestInit = {
      method: 'POST',
      body: formData, // FormData는 Content-Type을 자동으로 설정
    };

    return fetchApi('/post', options);
  },

  /**
   * 회원용 게시글 상세 조회
   *
   * 로그인한 사용자가 게시글의 상세 정보를 조회합니다.
   * 좋아요 상태, 댓글 등 모든 정보를 포함합니다.
   *
   * @param postId - 조회할 게시글 ID
   * @returns Promise<PostDetail> - 게시글 상세 정보
   */
  getPostDetail: async (postId: number) => {
    return fetchApi<PostDetail>(`/post/${postId}`, {
      method: 'GET',
    });
  },

  /**
   * 회원용 무한 스크롤 게시글 조회
   *
   * 로그인한 사용자를 위한 무한 스크롤 피드입니다.
   * 태그 존재 여부에 따라 필터링하고, 마지막 게시글 ID를 기준으로 페이지네이션합니다.
   *
   * @param params - 조회 파라미터
   * @param params.tagExist - 태그가 있는 게시글만 조회할지 여부
   * @param params.lastPostId - 마지막으로 조회한 게시글 ID (페이지네이션용)
   * @param params.pageSize - 한 번에 조회할 게시글 수
   * @returns Promise<PostCardProps[]> - 게시글 목록
   */
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

    return fetchApi<PostCardProps[]>(`/post?${searchParams}`, {
      method: 'GET',
    });
  },

  /**
   * 비회원용 무한 스크롤 게시글 조회
   *
   * 로그인하지 않은 사용자를 위한 공개 게시글 피드입니다.
   * 별도의 공개 API 엔드포인트를 사용하여 인증 없이 접근 가능합니다.
   *
   * @param params - 조회 파라미터
   * @param params.cursor_id - 커서 기반 페이지네이션용 ID
   * @param params.limit - 한 번에 조회할 게시글 수
   * @returns Promise<PostCardProps[]> - 게시글 목록
   */
  getPublicPosts: async (params: { cursor_id?: number; limit?: number }) => {
    const searchParams = new URLSearchParams({
      ...(params.cursor_id && { cursor_id: params.cursor_id.toString() }),
      limit: (params.limit || 15).toString(),
    });

    // 공개 API 엔드포인트 사용 (인증 불필요)
    const url = `${API_BASE_URL_PUBLIC}/posts/cursor?${searchParams}`;

    const response = await fetch(url, { method: 'GET' });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || '비회원 게시글 목록 조회 중 오류');
    }

    return data as PostCardProps[];
  },

  /**
   * 비회원용 게시글 상세 조회
   *
   * 로그인하지 않은 사용자가 게시글의 상세 정보를 조회합니다.
   * 좋아요 기능은 제한되지만 게시글 내용과 댓글은 볼 수 있습니다.
   *
   * @param postId - 조회할 게시글 ID
   * @returns Promise<PostDetail> - 게시글 상세 정보
   */
  getPublicPostDetail: async (postId: number) => {
    const url = `${API_BASE_URL_PUBLIC}/posts/${postId}`;

    const response = await fetch(url, { method: 'GET' });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || '비회원 게시글 상세 조회 중 오류');
    }

    return data as PostDetail;
  },

  /**
   * 게시글 수정
   *
   * 기존 게시글의 내용을 수정합니다. 이미지와 텍스트 모두 수정 가능합니다.
   *
   * @param postId - 수정할 게시글 ID
   * @param formData - 수정할 게시글 데이터
   * @returns Promise<PostResponse> - 수정된 게시글 정보
   */
  updatePost: async (
    postId: number,
    formData: FormData,
  ): Promise<PostResponse> => {
    return fetchApi(`/post/${postId}`, {
      method: 'PUT',
      body: formData,
    });
  },

  /**
   * 게시글 삭제
   *
   * 게시글을 완전히 삭제합니다. 작성자만 삭제할 수 있습니다.
   *
   * @param postId - 삭제할 게시글 ID
   */
  deletePost: async (postId: number): Promise<void> => {
    return fetchApi(`/post/${postId}`, {
      method: 'DELETE',
    });
  },

  /**
   * 게시글 좋아요
   *
   * 게시글에 좋아요를 추가합니다.
   *
   * @param postId - 좋아요할 게시글 ID
   * @returns Promise<PostLike> - 좋아요 상태 정보
   */
  likePost: async (postId: number): Promise<PostLike> => {
    return fetchApi(`/like/post/${postId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 게시글 좋아요 취소
   *
   * 게시글의 좋아요를 취소합니다.
   *
   * @param postId - 좋아요를 취소할 게시글 ID
   * @returns Promise<PostLike> - 좋아요 상태 정보
   */
  unlikePost: async (postId: number): Promise<PostLike> => {
    return fetchApi(`/unlike/post/${postId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },
};

/**
 * 댓글 관련 API 서비스
 *
 * 댓글 작성, 조회, 수정, 삭제 등 모든 댓글 관련 기능을 제공합니다.
 * 대댓글(답글) 기능도 지원합니다.
 */
export const commentService = {
  /**
   * 댓글 목록 조회 (무한 스크롤)
   *
   * 특정 게시글의 댓글을 무한 스크롤로 조회합니다.
   * 대댓글 구조를 지원하며, 페이지네이션을 통해 성능을 최적화합니다.
   *
   * @param params - 조회 파라미터
   * @param params.postId - 댓글을 조회할 게시글 ID
   * @param params.lastCommentId - 마지막으로 조회한 댓글 ID (페이지네이션용)
   * @param params.pageSize - 한 번에 조회할 댓글 수
   * @returns Promise<Comment[]> - 댓글 목록
   */
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

  /**
   * 댓글 작성
   *
   * 새로운 댓글을 작성합니다. 대댓글(답글) 작성도 지원합니다.
   *
   * @param postId - 댓글을 작성할 게시글 ID
   * @param content - 댓글 내용
   * @param parentCommentId - 부모 댓글 ID (대댓글인 경우)
   * @param userId - 댓글 작성자 ID (대댓글에서 멘션할 사용자)
   * @returns Promise<any> - 작성된 댓글 정보
   */
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

  /**
   * 댓글 수정
   *
   * 기존 댓글의 내용을 수정합니다. 작성자만 수정할 수 있습니다.
   *
   * @param commentId - 수정할 댓글 ID
   * @param content - 수정할 댓글 내용
   * @param postId - 댓글이 속한 게시글 ID
   * @param userId - 댓글 작성자 ID
   * @returns Promise<any> - 수정된 댓글 정보
   */
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

  /**
   * 댓글 삭제
   *
   * 댓글을 삭제합니다. 작성자만 삭제할 수 있습니다.
   *
   * @param commentId - 삭제할 댓글 ID
   */
  deleteComment: async (commentId: number) => {
    return fetchApi(`/comment/${commentId}`, {
      method: 'DELETE',
    });
  },
};

/**
 * 검색 관련 API 서비스
 *
 * 게시글과 사용자를 검색하는 기능을 제공합니다.
 * 키워드, MBTI, 취미 태그 등 다양한 조건으로 검색할 수 있습니다.
 */
export const searchService = {
  /**
   * 게시글 검색
   *
   * 다양한 조건으로 게시글을 검색합니다.
   * 키워드, 사용자명, MBTI, 취미 태그, 커서 기반 페이지네이션을 지원합니다.
   *
   * 제목 + 내용으로 게시글 검색
   *
   * @param params - 검색 파라미터
   * @param lastId - 마지막으로 조회한 게시글 ID (페이지네이션용)
   * @param pageSize - 한 번에 조회할 게시글 수
   * @returns Promise<SearchPost[]> - 검색 결과
   */
  getTitleAndContent: async (
    query: string,
    lastId?: number,
    pageSize: number = 15,
  ): Promise<SearchPost[]> => {
    const searchParams = new URLSearchParams({
      titleAndContent: query,
      ...(lastId && { lastId: lastId.toString() }),
      pageSize: pageSize.toString(),
    });
    // 공개 API 엔드포인트 사용 (인증 불필요)
    const url = `${API_BASE_URL_PUBLIC}/search/title-content?${searchParams.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || '제목 + 내용 검색 중 오류 ');
    }

    return await response.json();
  },

  /**
   * 작성자로 게시글 검색
   *
   * @param author - 검색 파라미터
   * @param lastId - 마지막으로 조회한 게시글 ID (페이지네이션용)
   * @param pageSize - 한 번에 조회할 게시글 수
   * @returns Promise<SearchPost[]> - 검색 결과
   */
  getAuthor: async (
    author: string,
    lastId?: number,
    pageSize: number = 15,
  ): Promise<SearchPost[]> => {
    const searchParams = new URLSearchParams({
      author,
      ...(lastId && { lastId: lastId.toString() }),
      pageSize: pageSize.toString(),
    });
    // 공개 API 엔드포인트 사용 (인증 불필요)
    const url = `${API_BASE_URL_PUBLIC}/search/author?${searchParams.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || '작성자 검색 중 오류 ');
    }

    return await response.json();
  },
};

/**
 * 마이페이지 관련 API 서비스
 *
 * 사용자 프로필 관리, 개인정보 수정, 내 게시글 관리 등
 * 마이페이지의 모든 기능을 제공합니다.
 */
export const userService = {
  /**
   * 마이페이지 정보 조회
   *
   * 사용자의 프로필 정보, 통계, 등급 등을 조회합니다.
   *
   * @returns Promise<MyPageInfo> - 마이페이지 정보
   */
  getMyPageInfo: async (): Promise<MyPageInfo> => {
    return fetchApi<MyPageInfo>('/my-page', {
      method: 'GET',
    });
  },

  /**
   * 내 게시글 목록 조회
   *
   * 현재 로그인한 사용자가 작성한 게시글 목록을 조회합니다.
   * 무한 스크롤을 지원합니다.
   *
   * @param lastPostId - 마지막으로 조회한 게시글 ID (페이지네이션용)
   * @param pageSize - 한 번에 조회할 게시글 수
   * @returns Promise<MyPostsResponse> - 내 게시글 목록
   */
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

  /**
   * 개인정보 수정 페이지 데이터 조회
   *
   * 개인정보 수정 페이지에 필요한 사용자 정보를 조회합니다.
   *
   * @returns Promise<MyPageModify> - 수정 가능한 사용자 정보
   */
  getMyModifyPage: async (): Promise<MyPageModify> => {
    return fetchApi<MyPageModify>('/my-page/my-modify-page', {
      method: 'GET',
    });
  },

  /**
   * 닉네임 중복 확인
   *
   * 닉네임 변경 시 중복 여부를 확인합니다.
   *
   * @param body - 닉네임 검증 요청 데이터
   * @returns Promise<NicknameValidationResponse> - 검증 결과
   */
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

  /**
   * 닉네임 변경
   *
   * 사용자의 닉네임을 변경합니다.
   *
   * @param body - 닉네임 변경 요청 데이터
   */
  updateNickname: async (body: UpdateNickname): Promise<void> => {
    return fetchApi<void>('/my-page/update/nickname', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  },

  /**
   * 현재 비밀번호 확인
   *
   * 비밀번호 변경 전 현재 비밀번호가 올바른지 확인합니다.
   *
   * @param currentPassword - 현재 비밀번호
   * @returns Promise<{ check: boolean }> - 확인 결과
   */
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

  /**
   * 비밀번호 변경
   *
   * 사용자의 비밀번호를 새로운 비밀번호로 변경합니다.
   *
   * @param body - 비밀번호 변경 요청 데이터
   */
  updatePassword: async (body: UpdatePassword): Promise<void> => {
    return fetchApi<void>('/my-page/update/password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  },

  /**
   * 프로필 이미지 업로드
   *
   * 사용자의 프로필 이미지를 업로드합니다.
   *
   * @param profileImage - 업로드할 프로필 이미지 파일
   * @returns Promise<ProfileImageUpload> - 업로드 결과
   */
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

  /**
   * 개인정보 수정 저장
   *
   * 사용자의 개인정보를 일괄 수정합니다.
   *
   * @param body - 수정할 개인정보 데이터
   */
  updateUserInfo: async (body: UpdateUserInfo): Promise<void> => {
    return fetchApi<void>('/my-page/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  },

  /**
   * 회원 탈퇴
   *
   * 사용자 계정을 완전히 삭제합니다.
   * 탈퇴 사유를 기록하여 서비스 개선에 활용합니다.
   *
   * @param reason - 탈퇴 사유
   * @returns Promise<{ message: string }> - 탈퇴 완료 메시지
   */
  deleteUser: async (reason: string): Promise<{ message: string }> => {
    return fetchApi('/user/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });
  },

  /**
   * 사용자 등급 조회
   *
   * 현재 사용자의 등급 정보를 조회합니다.
   *
   * @returns Promise<Rank> - 사용자 등급 정보
   */
  getUserRank: async (): Promise<Rank> => {
    return fetchApi<Rank>('/user-rank/me', {
      method: 'GET',
    });
  },

  /**
   * 사용자 레벨 조회
   *
   * 현재 사용자의 레벨을 조회합니다.
   *
   * @returns Promise<number> - 사용자 레벨
   */
  getUserLevel: async (): Promise<number> => {
    return fetchApi<number>('/user-rank/level', {
      method: 'GET',
    });
  },

  /**
   * 소셜 로그인 연동 정보 조회
   *
   * 현재 계정에 연동된 소셜 로그인 계정 정보를 조회합니다.
   *
   * @returns Promise<{ kakao: boolean; google: boolean }> - 연동된 소셜 계정 정보
   */
  getLoginStatus: async (): Promise<{ kakao: boolean; google: boolean }> => {
    return fetchApi('/oauth/status', {
      method: 'GET',
    });
  },
};

/**
 * 알림 관련 API 서비스
 *
 * 사용자 알림 관리 기능을 제공합니다.
 * 알림 조회, 읽음 처리, 삭제 등을 지원합니다.
 */
export const notificationService = {
  /**
   * 알림 리스트 조회
   *
   * 사용자의 알림 목록을 무한 스크롤로 조회합니다.
   *
   * @param lastNotificationId - 마지막으로 조회한 알림 ID (페이지네이션용)
   * @param pageSize - 한 번에 조회할 알림 수
   * @returns Promise<Notification[]> - 알림 목록
   */
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

  /**
   * 알림 상세 조회 및 삭제
   *
   * 특정 알림의 상세 정보를 조회하고 자동으로 읽음 처리합니다.
   *
   * @param notificationId - 조회할 알림 ID
   * @returns Promise<NotificationDetailResponse> - 알림 상세 정보
   */
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

  /**
   * 전체 알림 읽음 처리
   *
   * 모든 알림을 한 번에 읽음 처리합니다.
   */
  markAllRead: async (): Promise<void> => {
    return fetchApi<void>(`/notifications/read-all`, {
      method: 'POST',
    });
  },

  /**
   * 선택 알림 읽음 처리
   *
   * 사용자가 선택한 알림들만 읽음 처리합니다.
   *
   * @param notificationIds - 읽음 처리할 알림 ID 배열
   */
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

  /**
   * 읽지 않은 알림 개수 조회
   *
   * 사용자가 읽지 않은 알림의 개수를 조회합니다.
   * 헤더의 알림 뱃지에 표시되는 숫자입니다.
   *
   * @returns Promise<UnreadCountResponse> - 읽지 않은 알림 개수
   */
  getUnreadCount: async (): Promise<UnreadCountResponse> => {
    return fetchApi<UnreadCountResponse>(`/notifications/unread-count`, {
      method: 'GET',
    });
  },
};

/**
 * 챌린지 관련 API 서비스
 *
 * 사용자 등급 시스템의 챌린지 기능을 제공합니다.
 * 챌린지 시작, 조회 등을 지원합니다.
 */
export const challengeService = {
  /**
   * 챌린지 시작
   *
   * 특정 챌린지를 시작합니다.
   *
   * @param challengeNumber - 시작할 챌린지 번호
   */
  startChallenge: async (challengeNumber: number): Promise<void> => {
    return fetchApi(`/challenge/start/${challengeNumber}`, {
      method: 'POST',
    });
  },

  /**
   * 챌린지 조회
   *
   * 사용자가 참여할 수 있는 챌린지 목록을 조회합니다.
   *
   * @returns Promise<ChallengeApiResponse> - 챌린지 목록
   */
  getChallenges: async (): Promise<ChallengeApiResponse> => {
    return fetchApi('/challenge', {
      method: 'GET',
    });
  },
};
