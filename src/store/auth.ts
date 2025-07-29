import { AuthState } from '@/types/auth';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authApi } from '@/api/auth';
import { reissueAxiosInstance } from '@/api/axios_instance';

/**
 * 인증 상태 초기값
 *
 * 애플리케이션 시작 시 또는 로그아웃 시 사용되는 기본 상태입니다.
 *
 * 상태 구성:
 * - isAuthenticated: 인증 여부 (false)
 * - accessToken: 액세스 토큰 (null)
 * - refreshToken: 리프레시 토큰 (null)
 * - userId: 사용자 ID (null)
 * - isLoading: 로딩 상태 (false)
 * - isError: 에러 상태 (false)
 * - errorMessage: 에러 메시지 (null)
 * - hobbyTags: 사용자 취미 태그 배열 ([])
 * - nickname: 사용자 닉네임 (null)
 */
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

/**
 * 인증 상태 관리 스토어
 *
 * Zustand를 사용하여 애플리케이션의 인증 상태를 전역적으로 관리합니다.
 *
 * 주요 기능:
 * 1. 사용자 인증 상태 관리 (로그인/로그아웃)
 * 2. JWT 토큰 관리 (액세스 토큰, 리프레시 토큰)
 * 3. 토큰 자동 재발급 (리프레시 토큰 활용)
 * 4. 로컬 스토리지 및 쿠키를 통한 상태 영속화
 * 5. 비회원 사용자 관리
 * 6. 로딩 및 에러 상태 관리
 *
 * 기술적 특징:
 * - Zustand persist 미들웨어로 상태 영속화
 * - 로컬 스토리지와 쿠키 이중 저장
 * - 부분적 상태 영속화 (partialize)
 * - 자동 토큰 재발급 로직
 *
 * 보안 고려사항:
 * - 민감한 정보는 부분적 영속화로 제한
 * - 토큰 만료 시 자동 로그아웃
 * - 에러 발생 시 상태 초기화
 *
 * 사용자 경험:
 * - 페이지 새로고침 시 로그인 상태 유지
 * - 토큰 만료 시 자동 갱신
 * - 로그아웃 시 홈페이지 자동 이동
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initialState,

      // ===== 인증 관련 액션들 =====

      /**
       * 통합 인증 설정
       *
       * 로그인 성공 시 사용자의 인증 정보를 스토어에 저장합니다.
       *
       * 처리 과정:
       * 1. 인증 상태를 true로 설정
       * 2. 액세스 토큰과 리프레시 토큰 저장
       * 3. 사용자 ID, 닉네임, 취미 태그 저장
       * 4. 로딩 및 에러 상태 초기화
       *
       * @param params - 인증 정보 객체
       * @param params.accessToken - 액세스 토큰
       * @param params.refreshToken - 리프레시 토큰
       * @param params.userId - 사용자 ID
       * @param params.nickname - 사용자 닉네임
       * @param params.hobbyTags - 사용자 취미 태그 배열 (선택적)
       */
      setAuth: (params) => {
        // ===== 상태 업데이트 =====
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

      /**
       * 비회원 사용자 설정
       *
       * 로그아웃 또는 비회원 상태로 전환할 때 호출됩니다.
       * 모든 인증 관련 상태를 초기값으로 리셋합니다.
       *
       * 처리 과정:
       * 1. 모든 상태를 initialState로 초기화
       * 2. 인증 토큰 및 사용자 정보 제거
       * 3. 로딩 및 에러 상태 초기화
       */
      setPublicUser: () => {
        set(initialState);
      },

      /**
       * 로그아웃 처리
       *
       * 사용자 로그아웃을 처리하는 비동기 함수입니다.
       *
       * 처리 과정:
       * 1. 서버에 로그아웃 요청 전송
       * 2. 성공 시 로컬 상태 초기화
       * 3. 홈페이지로 리다이렉트
       * 4. 실패 시에도 로컬 상태는 초기화
       *
       * 에러 처리:
       * - 서버 통신 실패 시에도 로컬 상태 초기화
       * - 콘솔에 에러 로그 출력
       * - 사용자 경험을 위해 홈페이지 이동
       */
      logout: async () => {
        try {
          await authApi.logout();
          set(initialState);
          // ===== 로그아웃 후 홈페이지로 리다이렉트 =====
          window.location.href = '/';
        } catch (error) {
          console.error('로그아웃 중 오류 발생:', error);
          // ===== 에러가 발생해도 로컬 상태는 초기화 =====
          set(initialState);
        }
      },

      // ===== 상태 관리 액션들 =====

      /**
       * 로딩 상태 설정
       *
       * @param loading - 로딩 상태 (true/false)
       */
      setIsLoading: (loading: boolean) =>
        set((state) => ({ ...state, isLoading: loading })),

      /**
       * 에러 상태 설정
       *
       * @param error - 에러 상태 (true/false)
       */
      setIsError: (error: boolean) =>
        set((state) => ({ ...state, isError: error })),

      /**
       * 에러 메시지 설정
       *
       * @param message - 에러 메시지 (문자열 또는 null)
       */
      setErrorMessage: (message: string | null) =>
        set((state) => ({ ...state, errorMessage: message })),

      /**
       * 토큰 설정
       *
       * 액세스 토큰과 리프레시 토큰을 개별적으로 업데이트합니다.
       *
       * @param accessToken - 새로운 액세스 토큰
       * @param refreshToken - 새로운 리프레시 토큰
       */
      setTokens: (accessToken: string, refreshToken: string) =>
        set({ accessToken, refreshToken }),

      // ===== 토큰 재발급 =====

      /**
       * 토큰 재발급 처리
       *
       * 액세스 토큰이 만료되었을 때 리프레시 토큰을 사용하여
       * 새로운 액세스 토큰을 발급받는 비동기 함수입니다.
       *
       * 처리 과정:
       * 1. 현재 리프레시 토큰 확인
       * 2. 토큰 재발급 API 호출
       * 3. 성공 시 새로운 액세스 토큰 저장
       * 4. 실패 시 로그아웃 처리
       *
       * 에러 처리:
       * - 리프레시 토큰 없음: 로그아웃 처리
       * - 401 상태 코드: 리프레시 토큰 만료, 로그아웃 처리
       * - 기타 에러: 로그아웃 처리
       *
       * @returns 토큰 재발급 성공 여부 (boolean)
       */
      reissueToken: async () => {
        try {
          // ===== 현재 리프레시 토큰 가져오기 =====
          const refreshToken = useAuthStore.getState().refreshToken;

          // ===== 리프레시 토큰 없음 처리 =====
          if (!refreshToken) {
            set(initialState);
            return false;
          }

          const response = await reissueAxiosInstance.post(
            '/token/reissue',
            null,
            {
              headers: {
                refreshToken,
              },
            },
          );

          // ===== 액세스 토큰 업데이트 =====
          const { accessToken } = response.data;
          // accessToken만 새로 받아서 업데이트
          if (accessToken) {
            set((state) => ({
              ...state,
              accessToken,
              isAuthenticated: true,
            }));
            return true;
          }

          // ===== 응답 형식 오류 처리 =====
          throw new Error('토큰 재발급 응답 형식 오류');
        } catch (error: any) {
          if (error.response?.status === 401) {
            set(initialState);
            window.location.href = '/';
            return false;
          }

          set(initialState);
          window.location.href = '/';
          return false;
        }
      },
    }),
    {
      // ===== Zustand Persist 설정 =====

      /**
       * 스토리지 이름
       *
       * 로컬 스토리지와 쿠키에서 사용할 키 이름입니다.
       */
      name: 'auth-storage',

      /**
       * 커스텀 스토리지 설정
       *
       * 로컬 스토리지와 쿠키를 동시에 사용하여
       * 데이터 영속화를 이중으로 보장합니다.
       *
       * 특징:
       * - 로컬 스토리지 우선 확인
       * - 쿠키에서도 데이터 확인
       * - 둘 중 하나라도 있으면 데이터 반환
       * - 저장/삭제 시 양쪽 모두 처리
       */
      storage: createJSONStorage(() => ({
        /**
         * 데이터 조회
         *
         * 로컬 스토리지를 먼저 확인하고, 없으면 쿠키에서 확인합니다.
         *
         * @param name - 조회할 데이터 키
         * @returns 저장된 데이터 또는 null
         */
        getItem: (name) => {
          // ===== 로컬스토리지에서 먼저 확인 =====
          const localData = localStorage.getItem(name);

          // ===== 쿠키에서도 확인 =====
          const cookie = document.cookie
            .split('; ')
            .find((row) => row.startsWith(name + '='));
          const cookieData = cookie ? cookie.split('=')[1] : null;

          // ===== 둘 중 하나라도 있으면 반환 =====
          return localData || cookieData;
        },

        /**
         * 데이터 저장
         *
         * 로컬 스토리지와 쿠키 양쪽에 모두 저장합니다.
         *
         * @param name - 저장할 데이터 키
         * @param value - 저장할 데이터 값
         */
        setItem: (name, value) => {
          // ===== 로컬스토리지에 저장 =====
          localStorage.setItem(name, value);
          // ===== 쿠키에도 저장 =====
          document.cookie = `${name}=${value};path=/`;
        },

        /**
         * 데이터 삭제
         *
         * 로컬 스토리지와 쿠키 양쪽에서 모두 삭제합니다.
         *
         * @param name - 삭제할 데이터 키
         */
        removeItem: (name) => {
          // ===== 로컬스토리지에서 제거 =====
          localStorage.removeItem(name);
          // ===== 쿠키에서도 제거 =====
          document.cookie = `${name}=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        },
      })),

      /**
       * 부분적 상태 영속화
       *
       * 보안상 민감하지 않은 상태만 영속화하여
       * 보안을 강화하면서도 사용자 경험을 유지합니다.
       *
       * 영속화되는 상태:
       * - isAuthenticated: 인증 여부
       * - accessToken: 액세스 토큰
       * - refreshToken: 리프레시 토큰
       * - userId: 사용자 ID
       *
       * 영속화되지 않는 상태:
       * - isLoading: 로딩 상태 (임시)
       * - isError: 에러 상태 (임시)
       * - errorMessage: 에러 메시지 (임시)
       * - hobbyTags: 취미 태그 (선택적)
       * - nickname: 닉네임 (선택적)
       */
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        userId: state.userId,
      }),
    },
  ),
);
