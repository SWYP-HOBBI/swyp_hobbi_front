import {
  LoginResponse,
  SignupRequest,
  SocialLoginResponse,
} from '@/types/auth';
import { request } from './request';

export const authApi = {
  login: async (email: string, password: string) => {
    return request<LoginResponse>({
      url: '/user/login',
      method: 'POST',
      data: { email, password },
    });
  },
  signup: async (userData: SignupRequest) => {
    return request<LoginResponse>({
      url: '/user/signup',
      method: 'POST',
      data: userData,
    });
  },
  sendPasswordFindEmail: async (email: string) => {
    return request<void>({
      url: '/user/password/reset-link',
      method: 'POST',
      data: { email },
    });
  },
  checkEmailDuplicate: async (email: string) => {
    return request<{ isDuplicate: boolean }>({
      url: '/user/validation/email',
      method: 'POST',
      data: { email },
    });
  },
  logout: async () => {
    return request<void>({
      url: '/user/logout',
      method: 'POST',
    });
  },
  sendVerificationEmail: async (email: string) => {
    return request<void>({
      url: '/email/send',
      method: 'POST',
      data: { email },
    });
  },
  verifyEmail: async (email: string, code: string) => {
    return request<void>({
      url: '/email/verification/check',
      method: 'POST',
      data: { email, code },
    });
  },
  verifyPasswordFindEmail: async (token: string, email: string) => {
    return request<void>({
      url: '/user/password/verify/check',
      method: 'POST',
      data: { token, email },
    });
  },

  resetPassword: async (token: string, newPassword: string) => {
    return request<void>({
      url: '/user/password/reset',
      method: 'POST',
      data: { token, newPassword },
    });
  },
  checkNicknameDuplicate: async (nickname: string) => {
    return request<{ isDuplicate: boolean }>({
      url: '/user/validation/nickname',
      method: 'POST',
      data: { nickname },
    });
  },

  kakaoLogin: async (code: string) => {
    return request<SocialLoginResponse>({
      url: '/oauth/login/kakao',
      method: 'GET',
      params: { code },
    });
  },
  googleLogin: async (code: string) => {
    return request<SocialLoginResponse>({
      url: '/oauth/login/google',
      method: 'GET',
      params: { code },
    });
  },
  linkSocialAccount: async () => {
    return request<void>({
      url: '/oauth/link',
      method: 'POST',
    });
  },
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
