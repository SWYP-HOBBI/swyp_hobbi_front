'use client';

import SignupForm from '@/components/auth/signup_form';
import UserInfoForm from '@/components/auth/user_info_form';
import { SignupFormData, UserInfoFormData, LoginResponse } from '@/types/auth';
import { useRouter } from 'next/navigation';
import { useSignupStore } from '@/store/signup';
import { useAuthStore } from '@/store/auth';
import { useModalStore } from '@/store/modal';
import SvgIcon from '@/components/common/svg_icon';
import { useHobbyStore } from '@/store/hobby';
import { useEffect } from 'react';
import { authApi } from '@/api/auth';

/**
 * 회원가입 페이지 메인 컴포넌트
 *
 * 사용자의 회원가입 프로세스를 관리하는 페이지입니다.
 *
 * 주요 기능:
 * 1. 회원가입 단계별 폼 관리 (기본 정보 → 상세 정보)
 * 2. 회원가입 데이터 상태 관리 및 유효성 검사
 * 3. 일반 회원가입과 소셜 회원가입 구분 처리
 * 4. 회원가입 완료 후 인증 상태 설정
 * 5. 성공/실패 피드백 및 페이지 이동
 *
 * 회원가입 프로세스:
 * 1단계: 기본 정보 입력 (이름, 이메일, 비밀번호, 이메일 인증)
 * 2단계: 상세 정보 입력 (닉네임, 생년월일, 성별, MBTI, 취미)
 * 3단계: API 호출을 통한 회원가입 완료
 * 4단계: 인증 상태 설정 및 메인 페이지 이동
 *
 * 기술적 특징:
 * - Zustand를 통한 전역 상태 관리
 * - 단계별 컴포넌트 분리로 관심사 분리
 * - 일반/소셜 회원가입 통합 처리
 * - localStorage를 통한 임시 데이터 관리
 * - 모달을 통한 사용자 피드백
 * - Next.js App Router 사용
 */
export default function Signup() {
  // ===== 훅 및 스토어 초기화 =====

  /**
   * Next.js 라우터
   * 페이지 이동 및 뒤로 가기 기능에 사용
   */
  const router = useRouter();

  /**
   * 인증 스토어에서 인증 상태 설정 함수 가져오기
   * 회원가입 완료 후 사용자 인증 상태를 설정하는 데 사용
   */
  const { setAuth } = useAuthStore();

  /**
   * 취미 선택 초기화 함수
   * 회원가입 완료 후 취미 선택 상태를 초기화하는 데 사용
   */
  const resetSelections = useHobbyStore((state) => state.resetSelections);

  /**
   * 회원가입 관련 상태와 액션을 가져오는 스토어
   */
  const {
    signupStep, // 현재 회원가입 단계 ('signup' | 'userInfo')
    signupData, // 회원가입 데이터
    setSignupStep, // 회원가입 단계 설정 함수
    updateSignupData, // 회원가입 데이터 업데이트 함수
    resetSignup, // 회원가입 상태 초기화 함수
  } = useSignupStore();

  /**
   * 모달 스토어
   * 성공/실패 메시지 표시에 사용
   */
  const { openModal } = useModalStore();

  // ===== 이벤트 핸들러 함수들 =====

  /**
   * 회원가입 기본 정보 제출 핸들러
   *
   * 1단계 회원가입 폼에서 제출된 기본 정보를 처리합니다.
   *
   * 처리 과정:
   * 1. 제출된 데이터를 스토어에 업데이트
   * 2. 회원가입 단계를 'userInfo'로 변경
   * 3. 2단계 상세 정보 입력 폼으로 이동
   *
   * @param data - 1단계에서 제출된 기본 정보 (이름, 이메일, 비밀번호 등)
   */
  const handleSignup = (data: SignupFormData) => {
    updateSignupData(data);
    setSignupStep('userInfo');
  };

  /**
   * 사용자 상세 정보 제출 및 회원가입 완료 핸들러
   *
   * 2단계 회원가입 폼에서 제출된 상세 정보를 처리하고
   * 최종 회원가입 API 호출을 수행합니다.
   *
   * 처리 과정:
   * 1. 제출된 상세 정보를 스토어에 업데이트
   * 2. 일반 회원가입과 소셜 회원가입 구분
   * 3. API 호출을 통한 회원가입 완료
   * 4. 임시 데이터 정리 (localStorage)
   * 5. 인증 상태 설정
   * 6. 성공 모달 표시 및 메인 페이지 이동
   *
   * @param data - 2단계에서 제출된 상세 정보 (닉네임, 생년월일, 성별, MBTI, 취미 등)
   */
  const handleUserInfo = async (data: UserInfoFormData) => {
    try {
      // ===== 상세 정보 스토어 업데이트 =====
      updateSignupData(data);

      // ===== 최신 회원가입 데이터 가져오기 =====
      const currentSignupData = useSignupStore.getState().signupData;

      // ===== 일반 회원가입과 소셜 회원가입 구분 =====
      const isSocialSignup =
        currentSignupData.socialProvider && currentSignupData.socialId;

      // ===== API 호출을 통한 회원가입 완료 =====
      const { verificationCode, ...apiData } = currentSignupData;
      const userData: LoginResponse = await authApi.signup({
        ...apiData,
        // 소셜 회원가입의 경우 password 관련 필드 제외
        // 일반 회원가입의 경우 password 필드 포함
        ...(isSocialSignup
          ? {}
          : {
              username: currentSignupData.username!,
              password: currentSignupData.password!,
              passwordConfirm: currentSignupData.passwordConfirm!,
            }),
      });

      // ===== 회원가입 관련 임시 데이터 정리 =====
      localStorage.removeItem('signup-storage');
      if (!isSocialSignup) {
        // 일반 회원가입의 경우에만 이메일 인증 관련 데이터 정리
        localStorage.removeItem('verifiedEmail');
        localStorage.removeItem('emailVerified');
      }

      // ===== 인증 상태 설정 (hobbyTags 포함) =====
      setAuth(userData);

      // ===== 회원가입 성공 모달 표시 =====
      openModal({
        title: '환영합니다!',
        message: '회원가입이 완료되었어요.',
        confirmText: '확인',
        onConfirm: () => {
          // ===== 상태 초기화 및 페이지 이동 =====
          resetSignup(); // 회원가입 상태 초기화
          resetSelections(); // 취미 선택 상태 초기화
          router.push('/posts'); // 메인 페이지로 이동
        },
      });
    } catch (error) {
      // ===== 에러 처리 =====
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
   *
   * 2단계에서 1단계로 돌아가는 기능을 제공합니다.
   *
   * 특별한 처리:
   * - 소셜 로그인 사용자는 이전 단계로 돌아갈 수 없음
   * - 소셜 로그인 사용자의 경우 홈페이지로 이동
   * - 일반 회원가입 사용자의 경우 1단계로 이동
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
   * 뒤로가기 버튼 클릭 핸들러
   *
   * 브라우저의 뒤로가기 기능을 사용하여 이전 페이지로 이동합니다.
   */
  const handleBackButton = () => {
    router.back();
  };

  // ===== 사이드 이펙트 =====

  /**
   * 컴포넌트 마운트 시 초기화 작업
   *
   * 회원가입 페이지에 진입할 때마다 실행되는 초기화 로직입니다.
   *
   * 수행 작업:
   * 1. 회원가입 스토어 상태 초기화
   * 2. 이메일 인증 관련 localStorage 데이터 정리
   */
  useEffect(() => {
    // ===== 스토어 초기화 =====
    resetSignup();

    // ===== 로컬스토리지 초기화 =====
    localStorage.removeItem('emailVerified');
    localStorage.removeItem('verifiedEmail');
  }, [resetSignup]);

  // ===== JSX 렌더링 =====
  return (
    <div className="flex flex-col items-center px-4 py-8 w-full shadow-md rounded-3xl">
      {/* ===== 로고 섹션 ===== */}
      <div className="mb-4">
        <SvgIcon
          name="logo"
          width={120}
          height={35}
          className="max-md:hidden" // 모바일에서는 로고 숨김
        />
      </div>

      {/* ===== 회원가입 폼 조건부 렌더링 ===== */}
      {signupStep === 'signup' ? (
        // 1단계: 기본 정보 입력 폼
        <SignupForm onSubmit={handleSignup} onBackButton={handleBackButton} />
      ) : (
        // 2단계: 상세 정보 입력 폼
        <UserInfoForm onSubmit={handleUserInfo} onPrevStep={handlePrevStep} />
      )}
    </div>
  );
}
