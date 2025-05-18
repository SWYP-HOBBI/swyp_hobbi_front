'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authService } from '@/services/api';
import SvgIcon from '../common/svg_icon';
import { useModalStore } from '@/store/modal';

export default function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const { openModal } = useModalStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      const email = searchParams.get('email');
      const reset = searchParams.get('reset') === 'true';

      if (!token || !email) {
        setIsLoading(false);
        openModal({
          type: 'error',
          message: '유효하지 않은 인증 정보입니다.',
          confirmText: window.opener ? '창 닫기' : '이전 페이지로 돌아가기',
          onConfirm: () =>
            window.opener ? window.close() : window.history.back(),
        });
        return;
      }

      try {
        if (reset) {
          await authService.verifyPasswordFindEmail(token, email);
          localStorage.setItem('passwordResetToken', token);
          openModal({
            title: 'HOBBI',
            message: '이메일 인증이 완료되었습니다.',
            confirmText: '확인',
            onConfirm: () => {
              window.close();
            },
          });
        } else {
          await authService.verifyEmail(token, email);
          localStorage.setItem('emailVerified', 'true');
          localStorage.setItem('verifiedEmail', email);
          openModal({
            title: 'HOBBI',
            message:
              '이메일 인증이 완료되었습니다.\n회원가입을 계속 진행해주세요.',
            confirmText: '확인',
            onConfirm: () => {
              try {
                window.close();
              } catch (e) {
                console.error('창을 닫을 수 없습니다:', e);
              }
              window.location.href = `/signup`;
            },
          });
        }
      } catch (error) {
        openModal({
          type: 'error',
          message:
            error instanceof Error
              ? error.message
              : '이메일 인증 중 오류가 발생했습니다.',
          confirmText: window.opener ? '창 닫기' : '이전 페이지로 돌아가기',
          onConfirm: () =>
            window.opener ? window.close() : window.history.back(),
        });
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams, openModal]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full p-8 bg-grayscale-0 rounded-lg shadow-md">
        <SvgIcon name="logo" width={100} height={30} />
        {isLoading && (
          <div className="text-center mt-4">
            <p className="text-grayscale-100">이메일 인증을 진행 중입니다...</p>
          </div>
        )}
      </div>
    </div>
  );
}
