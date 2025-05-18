import { AuthState } from '@/types/auth';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authService } from '@/services/api';

const initialState = {
  isAuthenticated: false,
  accessToken: null,
  refreshToken: null,
  userId: null,
  isLoading: false,
  isError: false,
  errorMessage: null,
  hobbyTags: [],
  nickname: null,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initialState,

      // 통합 인증 설정
      setAuth: (params) => {
        // 상태 업데이트
        set((state) => ({
          ...state,
          isAuthenticated: true,
          accessToken: params.accessToken,
          refreshToken: params.refreshToken,
          userId: params.userId,
          hobbyTags: params.hobbyTags || [],
          isLoading: false,
          isError: false,
          errorMessage: null,
          nickname: params.nickname,
        }));
      },
      // 비회원
      setPublicUser: () => {
        set(initialState);
      },
      // 로그아웃
      logout: async () => {
        try {
          await authService.logout();
          set(initialState);
          // 로그아웃 후 홈페이지로 리다이렉트
          window.location.href = '/';
        } catch (error) {
          console.error('로그아웃 중 오류 발생:', error);
          // 에러가 발생해도 로컬 상태는 초기화
          set(initialState);
        }
      },

      setIsLoading: (loading: boolean) =>
        set((state) => ({ ...state, isLoading: loading })),
      setIsError: (error: boolean) =>
        set((state) => ({ ...state, isError: error })),
      setErrorMessage: (message: string | null) =>
        set((state) => ({ ...state, errorMessage: message })),

      setTokens: (accessToken: string, refreshToken: string) =>
        set({ accessToken, refreshToken }),

      reissueToken: async () => {
        try {
          const refreshToken = useAuthStore.getState().refreshToken;

          if (!refreshToken) {
            set(initialState);
            return false;
          }

          const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

          const response = await fetch(`${API_BASE_URL}/token/reissue`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              refreshToken: `${refreshToken}`,
            },
          });

          // 401 상태 코드일 경우 리프레시 토큰이 만료된 것
          if (response.status === 401) {
            set(initialState);
            window.location.href = '/';
            return false;
          }

          // 다른 에러 상태 코드
          if (!response.ok) {
            throw new Error('토큰 재발급 실패');
          }

          const data = await response.json();

          // accessToken만 새로 받아서 업데이트
          if (data.accessToken) {
            set((state) => ({
              ...state,
              accessToken: data.accessToken,
              isAuthenticated: true,
            }));
            return true;
          }

          throw new Error('토큰 재발급 응답 형식 오류');
        } catch (error) {
          console.error('❌ 토큰 재발급 에러:', error);
          set(initialState);
          window.location.href = '/';
          return false;
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          // 로컬스토리지에서 먼저 확인
          const localData = localStorage.getItem(name);

          // 쿠키에서도 확인
          const cookie = document.cookie
            .split('; ')
            .find((row) => row.startsWith(name + '='));
          const cookieData = cookie ? cookie.split('=')[1] : null;

          // 둘 중 하나라도 있으면 반환
          return localData || cookieData;
        },
        setItem: (name, value) => {
          // 로컬스토리지에 저장
          localStorage.setItem(name, value);
          // 쿠키에도 저장
          document.cookie = `${name}=${value};path=/`;
        },
        removeItem: (name) => {
          // 로컬스토리지에서 제거
          localStorage.removeItem(name);
          // 쿠키에서도 제거
          document.cookie = `${name}=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        },
      })),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        userId: state.userId,
      }),
    },
  ),
);
