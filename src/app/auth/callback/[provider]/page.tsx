'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { authService } from '@/services/api';

export default function SocialLoginCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const provider = window.location.pathname.split('/').pop() as
      | 'kakao'
      | 'google';

    const handleSocialLogin = async () => {
      try {
        if (error) {
          console.error('소셜 로그인 에러:', error);
          router.push('/?error=social_login_failed');
          return;
        }

        if (!code) {
          console.error('인증 코드가 없습니다.');
          router.push('/?error=no_code');
          return;
        }

        console.log('소셜 로그인 응답:', { provider, code });

        // 소셜 로그인 처리
        const loginService =
          provider === 'kakao'
            ? authService.kakaoLogin
            : authService.googleLogin;
        const userData = await loginService(code);

        // 인증 정보 저장
        setAuth(userData);

        // 메인 페이지로 리다이렉트
        router.push('/posts');
      } catch (error) {
        console.error('소셜 로그인 처리 중 에러:', error);
        router.push('/?error=login_failed');
      }
    };

    handleSocialLogin();
  }, [router, searchParams, setAuth]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">소셜 로그인 처리 중...</h1>
        <p className="text-gray-600">잠시만 기다려주세요.</p>
      </div>
    </div>
  );
}
