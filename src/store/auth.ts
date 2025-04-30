import { AuthState } from '@/types/auth';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // 초기 상태
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      userId: null,
      isLoading: false,
      isError: false,
      errorMessage: null,
      hobbyTags: [],

      // 통합 인증 설정
      setAuth: (params) =>
        set({
          isAuthenticated: true,
          accessToken: params.accessToken,
          refreshToken: params.refreshToken,
          userId: params.userId,
          isLoading: false,
          isError: false,
          errorMessage: null,
          hobbyTags: params.hobbyTags,
        }),

      // 로그아웃
      logout: () =>
        set({
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
          userId: null,
          isLoading: false,
          isError: false,
          errorMessage: null,
          hobbyTags: [],
        }),

      setIsLoading: (loading: boolean) => set({ isLoading: loading }),
      setIsError: (error: boolean) => set({ isError: error }),
      setErrorMessage: (message: string | null) =>
        set({ errorMessage: message }),
    }),

    // 로컬 스토리지에 저장
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        userId: state.userId,
        hobbyTags: state.hobbyTags,
      }),
    },
  ),
);
