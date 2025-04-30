'use client';

import SignupForm from '@/components/auth/signup_form';
import UserInfoForm from '@/components/auth/user_info_form';
import { SignupFormData, UserInfoFormData, LoginResponse } from '@/types/auth';
import { useRouter } from 'next/navigation';
import { useSignupStore } from '@/store/signup';
import { useAuthStore } from '@/store/auth';
import { useModalStore } from '@/store/modal';
import SvgIcon from '@/components/common/svg_icon';
import { authService } from '@/services/api';

export default function Signup() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { signupStep, setSignupStep, updateSignupData, resetSignup } =
    useSignupStore();
  const { openModal } = useModalStore();

  const handleSignup = (data: SignupFormData) => {
    updateSignupData(data);
    setSignupStep('userInfo');
  };

  const handleUserInfo = async (data: UserInfoFormData) => {
    try {
      updateSignupData(data);

      const signupData = useSignupStore.getState().signupData;

      const userData = (await authService.signup(signupData)) as LoginResponse;

      // 회원가입 성공 시 로컬 스토리지 데이터 정리
      localStorage.removeItem('signup-storage');
      localStorage.removeItem('verifiedEmail');
      localStorage.removeItem('emailVerified');

      setAuth({
        accessToken: userData.accessToken,
        refreshToken: userData.refreshToken,
        userId: userData.userId,
        hobbyTags: userData.hobbyTags,
      });

      openModal({
        title: '환영합니다.',
        message: '회원가입이 완료되었어요.',
        confirmText: '확인',
        onConfirm: () => {
          resetSignup();
          router.push('/posts');
        },
      });
    } catch (error) {
      console.error('회원가입 에러:', error);
    }
  };

  const handlePrevStep = () => {
    setSignupStep('signup');
  };

  const handleBackButton = () => {
    router.back();
  };

  return (
    <div className="flex flex-col items-center px-4 py-8 w-full shadow-md rounded-3xl">
      <div className="mb-4">
        <SvgIcon name="logo" width={120} height={35} />
      </div>
      {signupStep === 'signup' ? (
        <SignupForm onSubmit={handleSignup} onBackButton={handleBackButton} />
      ) : (
        <UserInfoForm onSubmit={handleUserInfo} onPrevStep={handlePrevStep} />
      )}
    </div>
  );
}
