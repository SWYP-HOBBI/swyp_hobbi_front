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
      try {
        const resolvedParams = await params;
        console.log('소셜 로그인 콜백 시작');
        console.log('Provider:', resolvedParams.provider);

        // URL 파라미터 상세 로깅
        const urlParams = new URLSearchParams(window.location.search);
        console.log('URL 전체:', window.location.href);
        console.log('Search string:', window.location.search);
        console.log(
          'URLSearchParams entries:',
          Array.from(urlParams.entries()),
        );

        const code = searchParams.get('code');
        console.log('searchParams.get("code"):', code);
        console.log('urlParams.get("code"):', urlParams.get('code'));

        if (!code) {
          console.log('인가 코드가 없습니다. 현재 URL을 확인해주세요.');
          throw new Error('인가 코드가 없습니다.');
        }

        // provider에 따른 소셜 로그인 API 호출
        const loginMethod =
          resolvedParams.provider === 'kakao'
            ? authService.kakaoLogin
            : authService.googleLogin;

        console.log('소셜 로그인 API 호출 시작');
        console.log('요청 데이터:', {
          code,
          provider: resolvedParams.provider,
        });
        const response = await loginMethod(code);
        console.log('소셜 로그인 응답:', response);

        if (!response) {
          throw new Error('소셜 로그인 처리 중 오류가 발생했습니다.');
        }

        if (!response.accessToken) {
          console.log('연동된 계정 없음');
          // 연동된 계정이 없는 경우
          openModal({
            title: '연동된 계정이 없습니다',
            message: '회원가입을 하시겠습니까?',
            confirmText: '회원가입',
            cancelText: '로그인하기',
            showCancelButton: true,
            onConfirm: () => {
              console.log('회원가입으로 이동');
              router.push('/signup');
            },
            onCancel: () => {
              console.log('로그인으로 이동');
              router.push('/login');
            },
          });
        } else {
          console.log('로그인 성공, 사용자 정보 저장');
          // 이미 연동된 계정이 있는 경우
          setAuth({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            userId: response.userId,
            hobbyTags: [], // 서버에서 제공하지 않음
            nickname: '', // 서버에서 제공하지 않음
          });
          console.log('posts 페이지로 이동');
          router.push('/posts');
        }
      } catch (error: any) {
        console.error('소셜 로그인 콜백 처리 오류:', error);
        console.error('에러 상세:', {
          message: error.message,
          stack: error.stack,
          response: error.response,
        });
        openModal({
          title: '오류',
          message: '소셜 로그인 처리 중 오류가 발생했습니다.',
          confirmText: '확인',
          onConfirm: () => {
            console.log('에러로 인해 로그인으로 이동');
            router.push('/login');
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
