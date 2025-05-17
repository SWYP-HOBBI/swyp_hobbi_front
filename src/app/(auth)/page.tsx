'use client';

import { useState } from 'react';
import SplashScreen from '@/components/auth/splash_screen';
import LoginForm from '@/components/auth/login_form';

export default function LoginPage() {
  // 스플래시 화면 표시 여부 상태
  const [showSplash, setShowSplash] = useState<boolean>(true);

  return (
    <main className="w-full">
      {/* 스플래시 화면 표시 */}
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      {/* 로그인 폼 표시 */}
      <LoginForm />
    </main>
  );
}
