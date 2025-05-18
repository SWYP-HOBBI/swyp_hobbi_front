'use client';

import VerifyEmailContent from '@/components/auth/verify_email_content';
import { Suspense } from 'react';

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="max-w-md w-full p-8 bg-grayscale-0 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-6 text-center">이메일 인증</h1>
            <div className="text-center">
              <p className="text-grayscale-100 mb-4">
                이메일 인증을 진행 중입니다...
              </p>
            </div>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
