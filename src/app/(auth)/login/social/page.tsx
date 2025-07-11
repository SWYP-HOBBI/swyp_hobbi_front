'use client';

import { LoginRequest } from '@/types/auth';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Input from '@/components/common/input';
import { authService } from '@/services/api';
import Button from '@/components/common/button';
import { useModalStore } from '@/store/modal';
import SvgIcon from '@/components/common/svg_icon';
import Link from 'next/link';

/**
 * 소셜 로그인 페이지 메인 컴포넌트
 *
 * 소셜 로그인 후 기존 계정과 연동하는 기능을 제공하는 페이지입니다.
 *
 * 주요 기능:
 * 1. 기존 계정 로그인 (이메일/비밀번호)
 * 2. 소셜 계정과 기존 계정 연동
 * 3. 연동 성공/실패 처리
 * 4. 사용자 선택에 따른 페이지 이동
 *
 * 사용 시나리오:
 * 1. 사용자가 소셜 로그인을 시도
 * 2. 해당 이메일로 가입된 기존 계정이 존재
 * 3. 이 페이지로 리다이렉트되어 기존 계정 로그인 요청
 * 4. 로그인 성공 후 계정 연동 여부 선택
 * 5. 연동 완료 또는 건너뛰기 후 메인 페이지 이동
 *
 * 기술적 특징:
 * - Zustand를 통한 전역 상태 관리
 * - 모달을 통한 사용자 선택 UI
 * - API 호출을 통한 계정 연동
 * - 에러 처리 및 사용자 피드백
 * - 반응형 디자인 (모바일/데스크톱)
 */
export default function SocialLoginPage() {
  // ===== 훅 및 스토어 초기화 =====

  /**
   * Next.js 라우터
   * 페이지 이동 및 리다이렉트에 사용
   */
  const router = useRouter();

  /**
   * 모달 스토어
   * 계정 연동 선택 UI와 에러 메시지 표시에 사용
   */
  const { openModal } = useModalStore();

  /**
   * 인증 스토어에서 필요한 상태와 액션을 가져오기
   */
  const {
    setAuth, // 인증 성공 시 사용자 정보 저장
    isLoading, // 로그인 진행 중 로딩 상태
    setIsLoading, // 로딩 상태 설정 함수
    isError, // 에러 발생 여부
    setIsError, // 에러 상태 설정 함수
    errorMessage, // 에러 메시지
    setErrorMessage, // 에러 메시지 설정 함수
  } = useAuthStore();

  // ===== 로컬 상태 관리 =====

  /**
   * 로그인 폼 데이터 상태
   * 사용자가 입력하는 이메일과 비밀번호를 저장
   */
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  });

  // ===== 이벤트 핸들러 함수들 =====

  /**
   * 입력 필드 변경 핸들러
   *
   * 사용자가 입력할 때마다 호출되며 다음 작업을 수행합니다:
   * 1. 폼 데이터 업데이트
   * 2. 이전 에러 상태 초기화
   *
   * @param e - 입력 이벤트 객체
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // 폼 데이터 업데이트
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // 사용자가 입력을 시작하면 이전 에러 메시지 초기화
    if (isError) {
      setIsError(false);
      setErrorMessage(null);
    }
  };

  /**
   * 로그인 폼 제출 핸들러
   *
   * 소셜 로그인 후 기존 계정 연동 프로세스의 핵심 함수입니다.
   *
   * 처리 과정:
   * 1. 기본 폼 제출 이벤트 방지
   * 2. 로딩 상태 활성화 및 에러 상태 초기화
   * 3. API 호출을 통한 로그인 시도
   * 4. 로그인 성공 시 인증 상태 저장
   * 5. 계정 연동 여부를 묻는 모달 표시
   * 6. 사용자 선택에 따른 후속 처리
   *
   * @param e - 폼 제출 이벤트 객체
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // 기본 폼 제출 동작 방지

    // ===== 로딩 상태 시작 및 에러 상태 초기화 =====
    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);

    try {
      // ===== API 호출을 통한 로그인 시도 =====
      const userData = await authService.login(
        formData.email,
        formData.password,
      );

      // ===== 로그인 성공 시 인증 상태 저장 =====
      setAuth(userData);

      // ===== 로그인 성공 후 계정 연동 선택 모달 표시 =====
      openModal({
        message: '기존 계정과\n연동하시겠습니까?',
        confirmText: '연동하기',
        cancelText: '다음에 하기',
        showCancelButton: true,
        onConfirm: async () => {
          // ===== 계정 연동 선택 시 처리 =====
          try {
            // API 호출을 통한 소셜 계정 연동
            await authService.linkSocialAccount();

            // 연동 성공 시 메인 페이지로 이동
            router.push('/posts');
          } catch (error) {
            // ===== 연동 실패 시 에러 처리 =====
            openModal({
              title: '오류',
              message: '계정 연동 중 오류가 발생했습니다.',
              confirmText: '확인',
              cancelText: '닫기',
              showCancelButton: true,
              onConfirm: () => {
                // 에러 확인 후 현재 페이지로 이동 (재시도 가능)
                router.push('/login/social');
              },
            });
          }
        },
        onCancel: () => {
          // ===== 연동 건너뛰기 선택 시 처리 =====
          // 연동하지 않고 메인 페이지로 이동
          router.push('/posts');
        },
      });
    } catch (error: any) {
      // ===== 로그인 실패 시 에러 처리 =====
      setIsError(true);

      // 에러 상태에 따른 구체적인 에러 메시지 설정
      if (error.status === 404 || error.status === 401) {
        setErrorMessage('이메일 또는 비밀번호가 잘못 되었습니다.');
      } else {
        setErrorMessage('로그인 중 오류가 발생했습니다');
      }
    } finally {
      // ===== 로딩 상태 종료 =====
      setIsLoading(false);
    }
  };

  // ===== JSX 렌더링 =====
  return (
    <div className="w-full flex flex-col items-center">
      {/* ===== 로고 섹션 ===== */}
      <SvgIcon
        name="logo"
        className="max-md:w-[150px] max-md:h-[44px] w-[240px] h-[70px]"
      />

      {/* ===== 로그인 폼 섹션 ===== */}
      <form
        onSubmit={handleSubmit}
        className="w-full space-y-8 mt-12 max-md:space-y-3"
      >
        {/* 이메일 입력 필드 */}
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="이메일"
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading} // 로딩 중일 때 비활성화
          required
          showClearButton // 입력값 지우기 버튼 표시
          error={errorMessage} // 에러 메시지 표시
        />

        {/* 비밀번호 입력 필드 */}
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="비밀번호"
          value={formData.password}
          onChange={handleChange}
          disabled={isLoading} // 로딩 중일 때 비활성화
          required
          showPasswordToggle // 비밀번호 표시/숨김 토글 버튼
          showClearButton // 입력값 지우기 버튼 표시
          error={errorMessage} // 에러 메시지 표시
        />

        {/* 로그인 제출 버튼 */}
        <Button
          type="submit"
          disabled={isLoading} // 로딩 중일 때 버튼 비활성화
          fullWidth
          className="max-md:text-sm"
        >
          로그인
        </Button>
      </form>

      {/* ===== 계정 관련 링크 섹션 ===== */}
      <div className="flex justify-end space-x-4 w-full mt-3">
        {/* 비밀번호 찾기 링크 */}
        <Link href="/find_password" className="text-xs text-grayscale-100">
          비밀번호 찾기
        </Link>
        {/* 회원가입 링크 */}
        <Link href="/signup" className="text-xs text-grayscale-100">
          회원가입
        </Link>
      </div>
    </div>
  );
}
