'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import SvgIcon from '../common/svg_icon';
import { authApi } from '@/api/auth';

export default function VerifyEmailContent() {
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPasswordReset, setIsPasswordReset] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      const email = searchParams.get('email');
      const reset = searchParams.get('reset') === 'true';
      setIsPasswordReset(reset);

      if (!token || !email) {
        setError('유효하지 않은 인증 정보입니다.');
        setIsLoading(false);
        return;
      }

      try {
        if (reset) {
          await authApi.verifyPasswordFindEmail(token, email);
          setIsSuccess(true);
          localStorage.setItem('passwordResetToken', token);
          setTimeout(() => {
            window.close();
          }, 2000);
        } else {
          await authApi.verifyEmail(token, email);
        }
        setIsSuccess(true);
        localStorage.setItem('emailVerified', 'true');
        localStorage.setItem('verifiedEmail', email);

        setTimeout(() => {
          try {
            window.close();
          } catch (e) {
            console.error('창을 닫을 수 없습니다:', e);
          }
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
      <div className="max-w-md w-full p-8 bg-grayscale-0 rounded-[20px] shadow-md">
        {isLoading && (
          <div className="text-center">
            <SvgIcon name="logo" className="w-[100px] h-[30px] mx-auto mb-8" />
            <p className="text-grayscale-100 mb-4">
              이메일 인증을 진행 중입니다...
            </p>
          </div>
        )}

        {!isLoading && isSuccess && (
          <div className="text-center">
            <SvgIcon name="logo" className="w-[100px] h-[30px] mx-auto mb-8" />
            <p className="text-primary-b40 text-xl font-semibold">
              이메일 인증이 완료 되었습니다.
            </p>
          </div>
        )}

        {!isLoading && error && (
          <div className="text-center">
            <SvgIcon name="logo" className="w-[100px] h-[30px] mx-auto mb-8" />
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
