'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authService } from '@/services/api';

/**
 * 이메일 인증 페이지
 *
 * URL 예시
 * http://localhost:3000/verify-email?token=2d4576cb-be1c-4cbb-b597-3f4e25f83363&email=luckseok1@gmail.com
 *
 * 주요 기능
 * 1. URL 파라미터에서 토큰과 이메일 추출
 * 2. 서버에 이메일 인증 요청
 * 3. 인증 결과에 따른 UI 표시
 * 4. 인증 성공시 로컬 스토리지 업데이트 및 페이지 리다이렉션
 */
export default function VerifyEmailPage() {
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(true); // 로딩 상태
  const [isSuccess, setIsSuccess] = useState(false); // 인증 성공 상태
  const [error, setError] = useState<string | null>(null); // 오류 메시지

  /**
   * 컴포넌트 마운트 시 이메일 인증 프로세스 실행
   */
  useEffect(() => {
    const verifyEmail = async () => {
      // URL 파라미터에서 토큰과 이메일 추출
      const token = searchParams.get('token'); //2d4576cb-be1c-4cbb-b597-3f4e25f83363
      const email = searchParams.get('email'); // luckseok1@gmail.com

      // 토큰과 이메일이 없으면 오류 메시지 표시
      if (!token || !email) {
        setError('유효하지 않은 인증 정보입니다.');
        setIsLoading(false);
        return;
      }

      try {
        // 이메일 인증 API 호출
        await authService.verifyEmail(token, email);

        // 인증 성공
        setIsSuccess(true);

        // 로컬 스토리지에 인증 상태 저장
        localStorage.setItem('emailVerified', 'true');
        localStorage.setItem('verifiedEmail', email);

        /**
         * 인증 성공 후 처리
         * 1. 2초 대기 후 실행
         * 2. 팝업창인 경우 닫기 시도
         * 3. 팝업창이 아니거나 닫기 실패 시 회원가입 페이지로 리다이렉트
         */
        setTimeout(() => {
          try {
            window.close();
          } catch (e) {
            console.error('창을 닫을 수 없습니다:', e);
          }

          // 창이 닫히지 않으면 리다이렉트
          window.location.href = `/signup`;
        }, 2000);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : '이메일 인증 중 오류가 발생했습니다.',
        );
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full p-8 bg-grayscale-0 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">이메일 인증</h1>

        {/* 로딩 상태 */}
        {isLoading && (
          <div className="text-center">
            <p className="text-grayscale-100 mb-4">
              이메일 인증을 진행 중입니다...
            </p>
          </div>
        )}

        {/* 인증 성공 상태 */}
        {!isLoading && isSuccess && (
          <div className="text-center">
            <p className="text-primary mb-2">이메일 인증이 완료되었습니다!</p>
            {window.opener ? (
              <p className="text-grayscale-100">
                이 창은 자동으로 닫히고 회원가입 페이지로 돌아갑니다.
              </p>
            ) : (
              <p className="text-grayscale-100">
                회원가입 페이지로 돌아가서 계속 진행해주세요.
              </p>
            )}
          </div>
        )}

        {/* 인증 실패 상태 */}
        {!isLoading && error && (
          <div className="text-center">
            <p className="text-like mb-2">인증 실패</p>
            <p className="text-grayscale-100">{error}</p>
            <button
              onClick={() =>
                window.opener ? window.close() : window.history.back()
              }
              className="mt-4 px-4 py-2 bg-primary text-grayscale-0 rounded-lg hover:bg-primary/80 transition-colors"
            >
              {window.opener ? '창 닫기' : '이전 페이지로 돌아가기'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
