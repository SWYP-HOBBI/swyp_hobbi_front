'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useModalStore } from '@/store/modal';
import Loader from '@/components/common/loader';
import { authService } from '@/services/api';

/**
 * 소셜 로그인 제공자 타입 정의
 * 현재 지원하는 소셜 로그인 제공자들
 */
type Provider = 'kakao' | 'google';

/**
 * 페이지 Props 타입 정의
 * Next.js App Router의 동적 라우팅 파라미터를 받는 타입
 */
type Props = {
  params: Promise<{
    provider: Provider; // URL 경로에서 추출된 소셜 로그인 제공자
  }>;
};

/**
 * 소셜 로그인 콜백 페이지 메인 컴포넌트
 *
 * 소셜 로그인 인증 후 OAuth 제공자로부터 리다이렉트되는 콜백 페이지입니다.
 *
 * 주요 기능:
 * 1. OAuth 인가 코드 처리
 * 2. 소셜 로그인 API 호출
 * 3. 기존 계정 연동 처리
 * 4. 신규 사용자 회원가입 안내
 * 5. 에러 처리 및 사용자 피드백
 *
 * 처리 시나리오:
 * 1. 사용자가 소셜 로그인 버튼 클릭
 * 2. OAuth 제공자(카카오/구글) 인증 페이지로 이동
 * 3. 사용자 인증 완료 후 이 콜백 페이지로 리다이렉트
 * 4. URL 파라미터에서 인가 코드 추출
 * 5. 인가 코드로 소셜 로그인 API 호출
 * 6. 응답에 따른 분기 처리:
 *    - 기존 계정 존재: 로그인 완료
 *    - 신규 사용자: 회원가입 안내 또는 계정 연동
 *
 * 기술적 특징:
 * - Next.js App Router 동적 라우팅 사용
 * - OAuth 2.0 인가 코드 플로우 처리
 * - 상태(state) 파라미터를 통한 출처 구분
 * - 모달을 통한 사용자 선택 UI
 * - 로딩 상태 표시
 * - 에러 처리 및 복구
 */
export default function SocialLoginCallback({ params }: Props) {
  // ===== 훅 및 스토어 초기화 =====

  /**
   * Next.js 라우터
   * 페이지 이동 및 리다이렉트에 사용
   */
  const router = useRouter();

  /**
   * URL 검색 파라미터 훅
   * OAuth 콜백에서 전달받은 파라미터들을 추출
   * - code: OAuth 인가 코드
   * - state: 요청 시 전달한 상태값 (출처 구분용)
   */
  const searchParams = useSearchParams();

  /**
   * 모달 스토어
   * 사용자 선택 UI와 에러 메시지 표시에 사용
   */
  const { openModal } = useModalStore();

  /**
   * 인증 스토어에서 인증 상태 설정 함수 가져오기
   * 소셜 로그인 성공 시 사용자 인증 상태를 설정하는 데 사용
   */
  const { setAuth } = useAuthStore();

  // ===== 사이드 이펙트 =====

  /**
   * 컴포넌트 마운트 시 OAuth 콜백 처리
   *
   * 소셜 로그인 인증 후 리다이렉트되는 즉시 실행되는 핵심 로직입니다.
   *
   * 처리 과정:
   * 1. URL 파라미터에서 인가 코드와 상태값 추출
   * 2. 출처 구분 (마이페이지 vs 일반 소셜 로그인)
   * 3. 소셜 로그인 API 호출
   * 4. 응답에 따른 분기 처리
   * 5. 에러 처리 및 사용자 피드백
   */
  useEffect(() => {
    const handleCallback = async () => {
      // ===== URL 파라미터 추출 및 출처 구분 =====
      const state = searchParams.get('state');
      const isFromMyPage = state === 'mypage'; // 마이페이지에서 온 경우 구분

      try {
        // ===== 동적 라우팅 파라미터 해결 =====
        const resolvedParams = await params;
        const code = searchParams.get('code');

        // ===== 인가 코드 유효성 검사 =====
        if (!code) {
          throw new Error('인가 코드가 없습니다.');
        }

        // ===== 제공자별 소셜 로그인 API 호출 =====
        const loginMethod =
          resolvedParams.provider === 'kakao'
            ? authService.kakaoLogin // 카카오 로그인
            : authService.googleLogin; // 구글 로그인

        const response = await loginMethod(code);

        // ===== API 응답 유효성 검사 =====
        if (!response) {
          throw new Error('소셜 로그인 처리 중 오류가 발생했습니다.');
        }

        // ===== 응답에 따른 분기 처리 =====
        if (!response.accessToken) {
          // ===== 기존 계정이 없는 경우 (신규 사용자 또는 연동 필요) =====

          if (isFromMyPage) {
            // ===== 마이페이지에서 온 경우: 계정 연동 시도 =====
            openModal({
              message: '기존 계정과\n연동하시겠습니까?',
              confirmText: '연동하기',
              cancelText: '다음에 하기',
              showCancelButton: true,
              onConfirm: async () => {
                try {
                  // ===== 계정 연동 API 호출 =====
                  await authService.linkSocialAccount();

                  // ===== 연동 성공 시 마이페이지로 이동 =====
                  router.push('/my_page');
                } catch (error) {
                  // ===== 연동 실패 시 에러 처리 =====
                  openModal({
                    title: '오류',
                    message: '계정 연동 중 오류가 발생했습니다.',
                    confirmText: '확인',
                    cancelText: '닫기',
                    showCancelButton: true,
                    onConfirm: () => {
                      // ===== 에러 확인 후 소셜 로그인 페이지로 이동 (재시도 가능) =====
                      router.push('/login/social');
                    },
                  });
                }
              },
              onCancel: () => {
                // ===== 연동 건너뛰기 시 마이페이지로 이동 =====
                router.push('/my_page');
              },
            });
          } else {
            // ===== 일반 소셜 로그인의 경우: 회원가입 안내 =====
            openModal({
              title: '연동된 계정이 없습니다',
              message: '회원가입을 하시겠습니까?',
              confirmText: '회원가입',
              cancelText: '로그인하기',
              showCancelButton: true,
              onConfirm: () => {
                // ===== 회원가입 선택 시 회원가입 페이지로 이동 =====
                router.push('/signup');
              },
              onCancel: () => {
                // ===== 로그인 선택 시 소셜 로그인 페이지로 이동 =====
                router.push('/login/social');
              },
            });
          }
        } else {
          // ===== 기존 계정이 있는 경우: 로그인 완료 =====

          // ===== 인증 상태 설정 =====
          setAuth({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken || '',
            userId: response.userId || 0,
          });

          // ===== 로그인 성공 시 메인 페이지로 이동 =====
          router.push('/posts');
        }
      } catch (error: any) {
        // ===== 에러 처리 =====
        openModal({
          title: '오류',
          message: '소셜 로그인 처리 중 오류가 발생했습니다.',
          confirmText: '확인',
          showCancelButton: false,
          onConfirm: () => {
            // ===== 출처에 따른 에러 후 페이지 이동 =====
            router.push(isFromMyPage ? '/my_page' : '/login/social');
          },
        });
      }
    };

    // ===== 콜백 처리 함수 실행 =====
    handleCallback();
  }, [params, searchParams, router, openModal, setAuth]);

  // ===== JSX 렌더링 =====

  /**
   * 로딩 화면 렌더링
   *
   * OAuth 콜백 처리 중 사용자에게 표시되는 로딩 UI입니다.
   * 처리 시간이 짧지만 네트워크 지연이나 API 응답 시간을 고려하여
   * 사용자에게 진행 상황을 알려주는 역할을 합니다.
   */
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        {/* 로딩 스피너 */}
        <Loader />
        {/* 로딩 메시지 */}
        <p className="mt-4 text-grayscale-60">소셜 로그인 처리 중...</p>
      </div>
    </div>
  );
}
