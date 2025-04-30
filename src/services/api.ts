import { LoginResponse, SignupRequest } from '@/types/auth';

const API_BASE_URL = 'http://110.165.16.69:8080/api/v1';

// API 요청 helper 함수
export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(url, { ...defaultOptions, ...options });

  // Content-Type 헤더 확인
  const contentType = response.headers.get('content-type');

  // JSON 데이터인 경우에만 JSON으로 파싱
  let data;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    // 텍스트 응답인 경우
    data = await response.text();
  }

  if (!response.ok) {
    throw new Error(
      typeof data === 'string'
        ? data
        : data.message || '요청 처리 중 오류가 발생했습니다.',
    );
  }

  return data as T;
}

// 인증 관련 API 서비스
export const authService = {
  // 로그인
  login: async (email: string, password: string): Promise<LoginResponse> => {
    return fetchApi('/user/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  // 회원가입
  signup: async (userData: SignupRequest) => {
    return fetchApi('/user/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // 이메일 중복 확인
  checkEmailDuplicate: async (email: string) => {
    return fetchApi('/user/validation/email', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // 이메일 인증 전송
  sendVerificationEmail: async (email: string) => {
    return fetchApi('/email/send', {
      method: 'POST',
      body: JSON.stringify({ email }),
      credentials: 'include',
    });
  },

  // 이메일 인증 확인
  verifyEmail: async (token: string, email: string) => {
    return fetchApi('/email/verification/check', {
      method: 'POST',
      body: JSON.stringify({ token, email }),
      credentials: 'include',
    });
  },

  // 닉네임 중복 확인
  checkNicknameDuplicate: async (nickname: string) => {
    return fetchApi('/user/validation/nickname', {
      method: 'POST',
      body: JSON.stringify({ nickname }),
    });
  },
};
