'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useModalStore } from '@/store/modal';
import Loader from '@/components/common/loader';
import { authService } from '@/services/api';

type Provider = 'kakao' | 'google';

type Props = {
  params: Promise<{
    provider: Provider;
  }>;
};

export default function SocialLoginCallback({ params }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { openModal } = useModalStore();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      const state = searchParams.get('state');
      const isFromMyPage = state === 'mypage';

      try {
        const resolvedParams = await params;
        const code = searchParams.get('code');

        if (!code) {
          throw new Error('인가 코드가 없습니다.');
        }

        // provider에 따른 소셜 로그인 API 호출
        const loginMethod =
          resolvedParams.provider === 'kakao'
            ? authService.kakaoLogin
            : authService.googleLogin;

        const response = await loginMethod(code);

        if (!response) {
          throw new Error('소셜 로그인 처리 중 오류가 발생했습니다.');
        }

        if (!response.accessToken) {
          // 마이페이지에서 온 경우 바로 연동 시도
          if (isFromMyPage) {
            openModal({
              message: '기존 계정과\n연동하시겠습니까?',
              confirmText: '연동하기',
              cancelText: '다음에 하기',
              showCancelButton: true,
              onConfirm: async () => {
                try {
                  await authService.linkSocialAccount();
                  router.push('/my_page');
                } catch (error) {
                  openModal({
                    title: '오류',
                    message: '계정 연동 중 오류가 발생했습니다.',
                    confirmText: '확인',
                    cancelText: '닫기',
                    showCancelButton: true,
                    onConfirm: () => {
                      router.push('/login/social');
                    },
                  });
                }
              },
              onCancel: () => {
                router.push('/my_page');
              },
            });
          } else {
            // 일반 소셜 로그인의 경우 기존 로직 유지
            openModal({
              title: '연동된 계정이 없습니다',
              message: '회원가입을 하시겠습니까?',
              confirmText: '회원가입',
              cancelText: '로그인하기',
              showCancelButton: true,
              onConfirm: () => {
                router.push('/signup');
              },
              onCancel: () => {
                router.push('/login/social');
              },
            });
          }
        } else {
          setAuth({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken || '',
            userId: response.userId || 0,
          });
          router.push('/posts');
        }
      } catch (error: any) {
        openModal({
          title: '오류',
          message: '소셜 로그인 처리 중 오류가 발생했습니다.',
          confirmText: '확인',
          showCancelButton: false,
          onConfirm: () => {
            router.push(isFromMyPage ? '/my_page' : '/login/social');
          },
        });
      }
    };

    handleCallback();
  }, [params, searchParams, router, openModal, setAuth]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader />
        <p className="mt-4 text-grayscale-60">소셜 로그인 처리 중...</p>
      </div>
    </div>
  );
}
