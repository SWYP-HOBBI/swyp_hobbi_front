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
import { useHobbyStore } from '@/store/hobby';

/**
 * 회원가입 페이지
 *
 * 주요 기능
 * 1. 회원가입 단계별 폼 관리
 * 2. 회원가입 데이터 상태 관리
 * 3. 회원가입 완료 후 인증 처리
 */
export default function Signup() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const resetSelections = useHobbyStore((state) => state.resetSelections);
  const {
    signupStep,
    signupData,
    setSignupStep,
    updateSignupData,
    resetSignup,
  } = useSignupStore();
  const { openModal } = useModalStore();

  /**
   * 회원가입 기본 정보 제출 핸들러
   */
  const handleSignup = (data: SignupFormData) => {
    updateSignupData(data);
    setSignupStep('userInfo');
  };

  /**
   * 사용자 상세 정보 제출 및 회원가입 완료 핸들러
   */
  const handleUserInfo = async (data: UserInfoFormData) => {
    try {
      updateSignupData(data);
      const currentSignupData = useSignupStore.getState().signupData;

      // 일반 회원가입과 소셜 회원가입 구분
      const isSocialSignup =
        currentSignupData.socialProvider && currentSignupData.socialId;

      const userData: LoginResponse = await authService.signup({
        ...currentSignupData,
        // 소셜 회원가입의 경우 password 관련 필드 제외
        ...(isSocialSignup
          ? {}
          : {
              username: currentSignupData.username!,
              password: currentSignupData.password!,
              passwordConfirm: currentSignupData.passwordConfirm!,
            }),
      });

      console.log('회원가입 응답 데이터:', userData);

      // 회원가입 관련 임시 데이터 정리
      localStorage.removeItem('signup-storage');
      if (!isSocialSignup) {
        localStorage.removeItem('verifiedEmail');
        localStorage.removeItem('emailVerified');
      }

      // 인증 상태 설정 (hobbyTags 포함)
      setAuth(userData);

      // 회원가입 성공 모달 표시
      openModal({
        title: '환영합니다.',
        message: '회원가입이 완료되었어요.',
        confirmText: '확인',
        onConfirm: () => {
          resetSignup();
          resetSelections();
          router.push('/posts');
        },
      });
    } catch (error) {
      console.error('회원가입 에러:', error);
      openModal({
        title: '오류',
        message: '회원가입 중 오류가 발생했습니다.',
        confirmText: '확인',
      });
    }
  };

  /**
   * 이전 단계로 이동 핸들러
   */
  const handlePrevStep = () => {
    // 소셜 로그인 사용자는 이전 단계로 돌아갈 수 없음
    if (signupData.socialProvider) {
      router.push('/');
      return;
    }
    setSignupStep('signup');
  };

  /**
   * 뒤로가기 버튼 클릭 시 이전 페이지로 이동
   */
  const handleBackButton = () => {
    router.back();
  };

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

      {/* 회원가입 폼 렌더링 */}
      {signupStep === 'signup' ? (
        <SignupForm onSubmit={handleSignup} onBackButton={handleBackButton} />
      ) : (
        <UserInfoForm onSubmit={handleUserInfo} onPrevStep={handlePrevStep} />
      )}
    </div>
  );
}
