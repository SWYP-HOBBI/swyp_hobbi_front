'use client';
import { useEffect } from 'react';
import PasswordFind from '@/components/auth/password_find';
import SvgIcon from '@/components/common/svg_icon';
import { useSignupStore } from '@/store/signup';

export default function FindPassword() {
  const resetSignup = useSignupStore((state) => state.resetSignup);

  useEffect(() => {
    // 스토어 초기화
    resetSignup();

    // 로컬스토리지 초기화
    localStorage.removeItem('emailVerified');
    localStorage.removeItem('verifiedEmail');
  }, [resetSignup]);

  return (
    <div className="flex flex-col items-center px-4 py-8 w-full shadow-md rounded-3xl">
      <div className="mb-4">
        <SvgIcon
          name="logo"
          width={120}
          height={35}
          className="max-md:hidden"
        />
      </div>
      <PasswordFind />
    </div>
  );
}
