'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useModalStore } from '@/store/modal';
import Loader from '@/components/common/loader';
import { authService } from '@/services/api';
import { SocialLoginResponse } from '@/types/auth';

export default function SocialLoginCallback({
  params,
}: {
  params: { provider: string };
}) {
  const router = useRouter();
  const { openModal } = useModalStore();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // // provider에 따른 소셜 로그인 API 호출
        // const loginMethod =
        //   params.provider === 'kakao'
        //     ? authService.kakaoLogin
        //     : authService.googleLogin;
        // const response = (await loginMethod()) as SocialLoginResponse;
        // provider에 따른 소셜 로그인 API 호출
        const response = (await fetch(
          `http://localhost:3000/oauth2/authorization/${params.provider}`,
          {
            method: 'GET',
          },
        ).then((res) => res.json())) as SocialLoginResponse;

        if (!response) {
          throw new Error('소셜 로그인 처리 중 오류가 발생했습니다.');
        }

        if (!response.accessToken) {
          // 연동된 계정이 없는 경우
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
        } else {
          // 이미 연동된 계정이 있는 경우
          setAuth({
            accessToken: response.accessToken,
            refreshToken: '', // 서버에서 제공하지 않는 경우
            userId: 0, // 서버에서 제공하지 않는 경우
            hobbyTags: [], // 서버에서 제공하지 않는 경우
            nickname: '', // 서버에서 제공하지 않는 경우
          });
          router.push('/posts');
        }
      } catch (error) {
        console.error('소셜 로그인 콜백 처리 오류:', error);
        openModal({
          title: '오류',
          message: '소셜 로그인 처리 중 오류가 발생했습니다.',
          confirmText: '확인',
          onConfirm: () => router.push('/'),
        });
      }
    };

    handleCallback();
  }, []);

  // 로딩 상태 표시
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader />
        <p className="mt-4 text-grayscale-60">소셜 로그인 처리 중...</p>
      </div>
    </div>
  );
}
