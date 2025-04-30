'use client';

import { useState } from 'react';
import SplashScreen from '@/components/auth/splash_screen';
import LoginForm from '@/components/auth/login_form';

export default function LoginPage() {
  const [showSplash, setShowSplash] = useState<boolean>(true);

  return (
    <main className="w-full">
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      <LoginForm />
    </main>
  );
}
