'use client';

import { useSignupStore } from '@/store/signup';
import Input from '@/components/common/input';
import Button from '@/components/common/button';
import { useEmailVerification } from '@/hooks/use_email_verification';
import SvgIcon from '../common/svg_icon';
import { authService } from '@/services/api';
import { useRouter } from 'next/navigation';
import { useModalStore } from '@/store/modal';
import { useState, useCallback } from 'react';
import { z } from 'zod';

// ===== ZOD 스키마 정의 =====

/**
 * 비밀번호 찾기 폼 전체 데이터 유효성 검사를 위한 Zod 스키마
 *
 * 각 필드별 검증 규칙:
 * - email: 유효한 이메일 형식
 * - password: 8-20자, 영문 대소문자+숫자 포함
 * - passwordConfirm: password와 일치 여부 확인
 *
 * 비밀번호 변경 시에만 사용되며, 이메일 인증 후에 표시됩니다.
 */
const PasswordFindSchema = z
  .object({
    email: z.string().email('유효한 이메일을 입력해주세요.'),
    password: z
      .string()
      .min(8, '비밀번호는 8자 이상이어야 합니다.')
      .max(20, '비밀번호는 20자 이하여야 합니다.')
      .regex(/[A-Z]/, '영문 대문자를 포함해야 합니다.')
      .regex(/[a-z]/, '영문 소문자를 포함해야 합니다.')
      .regex(/[0-9]/, '숫자를 포함해야 합니다.'),
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['passwordConfirm'], // 에러가 발생한 필드 지정
  });

/**
 * 이메일 유효성 검사 스키마
 * 실시간 유효성 검사를 위해 개별적으로 정의
 */
const EmailSchema = z.string().email('유효한 이메일을 입력해주세요.');

/**
 * 비밀번호 찾기 메인 컴포넌트
 *
 * 사용자가 비밀번호를 잊어버렸을 때 새로운 비밀번호로 재설정하는 기능을 제공합니다.
 *
 * 주요 기능:
 * 1. 이메일 인증 (비밀번호 재설정 메일 전송)
 * 2. 새 비밀번호 입력 및 확인
 * 3. 실시간 유효성 검사
 * 4. 비밀번호 재설정 API 호출
 * 5. 성공/실패 피드백 및 로그인 페이지 이동
 *
 * 프로세스:
 * 1. 사용자가 이메일 입력
 * 2. 이메일 인증 메일 전송 및 인증
 * 3. 인증 완료 후 새 비밀번호 입력 필드 표시
 * 4. 새 비밀번호 입력 및 유효성 검사
 * 5. API 호출을 통한 비밀번호 재설정
 * 6. 성공 시 로그인 페이지로 이동
 *
 * 기술적 특징:
 * - Zod를 사용한 강력한 유효성 검사
 * - Zustand를 통한 전역 상태 관리
 * - 커스텀 훅을 통한 이메일 인증 로직 재사용
 * - localStorage를 통한 인증 토큰 관리
 * - 모달을 통한 사용자 피드백
 * - 반응형 디자인 (모바일/데스크톱)
 */
export default function PasswordFind({}) {
  // ===== 스토어 및 훅 초기화 =====

  /**
   * 회원가입 스토어에서 필요한 상태들을 가져옴
   * 비밀번호 찾기에서도 동일한 상태 구조를 재사용
   */
  const {
    signupData, // 폼 데이터 (이메일, 비밀번호, 비밀번호 확인)
    updateSignupData, // 폼 데이터 업데이트 함수
    isEmailVerified, // 이메일 인증 완료 여부
    isLoading, // 로딩 상태
    isError, // 에러 발생 여부
    errorMessage, // 에러 메시지
  } = useSignupStore();

  /**
   * Next.js 라우터
   * 페이지 이동 및 뒤로 가기 기능에 사용
   */
  const router = useRouter();

  /**
   * 모달 스토어
   * 성공/실패 메시지 표시에 사용
   */
  const { openModal } = useModalStore();

  /**
   * 이메일 인증 관련 기능을 제공하는 커스텀 훅
   *
   * 설정:
   * - sendVerificationEmail: 비밀번호 찾기용 이메일 전송 함수
   * - skipDuplicateCheck: 중복 검사 건너뛰기 (비밀번호 찾기는 중복 검사 불필요)
   */
  const { isEmailSent, emailTimer, formatTime, checkEmailAndSendVerification } =
    useEmailVerification({
      sendVerificationEmail: authService.sendPasswordFindEmail, // 비밀번호 찾기용 이메일 전송
      skipDuplicateCheck: true, // 중복 검사 건너뛰기
    });

  // ===== 로컬 상태 관리 =====

  /**
   * Zod 유효성 검사 에러 상태
   * 각 필드별 실시간 유효성 검사 결과를 저장
   */
  type PasswordFindFormError = Partial<
    Record<'email' | 'password' | 'passwordConfirm', string>
  >;
  const [formError, setFormError] = useState<PasswordFindFormError>({});

  // ===== 이벤트 핸들러 함수들 =====

  /**
   * 입력 필드 변경 핸들러
   *
   * 사용자가 입력할 때마다 호출되며 다음 작업을 수행합니다:
   * 1. 스토어의 폼 데이터 업데이트
   * 2. 실시간 유효성 검사 수행
   * 3. 에러 상태 업데이트
   *
   * 특별한 처리:
   * - 비밀번호/비밀번호 확인: 전체 스키마 검증으로 일치 여부 확인
   * - 이메일: 개별 스키마로 실시간 검증
   *
   * @param e - 입력 이벤트 객체
   */
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;

      // 스토어의 폼 데이터 업데이트
      updateSignupData({ [name]: value });

      // ===== 비밀번호 관련 필드 특별 처리 =====
      if (name === 'password' || name === 'passwordConfirm') {
        // 비밀번호 변경 시 전체 스키마로 검증 (일치 여부 확인을 위해)
        const nextData = { ...signupData, [name]: value };
        const result = PasswordFindSchema.safeParse(nextData);

        setFormError((prev) => ({
          ...prev,
          password: result.success
            ? undefined
            : result.error.errors.find((e) => e.path[0] === 'password')
                ?.message,
          passwordConfirm: !nextData.passwordConfirm
            ? undefined // 비밀번호 확인이 비어있으면 에러 표시하지 않음
            : result.success
              ? undefined
              : result.error.errors.find((e) => e.path[0] === 'passwordConfirm')
                  ?.message,
        }));
        return;
      }

      // ===== 이메일 실시간 유효성 검사 =====
      if (name === 'email') {
        const result = EmailSchema.safeParse(value);
        setFormError((prev) => ({
          ...prev,
          email: result.success ? undefined : result.error.errors[0].message,
        }));
      }
    },
    [signupData, updateSignupData],
  );

  /**
   * 폼 전체 유효성 검사 함수
   *
   * 제출 버튼 활성화 여부를 결정하는 데 사용됩니다.
   *
   * @returns {boolean} 폼이 유효하고 이메일이 인증되었는지 여부
   */
  const isFormValid = useCallback(() => {
    const result = PasswordFindSchema.safeParse(signupData);
    return result.success && isEmailVerified; // 모든 검증 통과 + 이메일 인증 완료
  }, [signupData, isEmailVerified]);

  /**
   * 폼 제출 핸들러
   *
   * 비밀번호 재설정 프로세스의 핵심 함수로, 다음 단계를 수행합니다:
   * 1. Zod를 통한 전체 폼 유효성 검사
   * 2. 이메일 인증 완료 여부 확인
   * 3. localStorage에서 인증 토큰 확인
   * 4. API 호출을 통한 비밀번호 재설정
   * 5. 성공/실패에 따른 사용자 피드백
   *
   * @param e - 폼 제출 이벤트 객체
   */
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault(); // 기본 폼 제출 동작 방지

      // ===== Zod 전체 폼 유효성 검사 =====
      const result = PasswordFindSchema.safeParse(signupData);
      if (!result.success) {
        // 유효성 검사 실패 시 필드별 에러 메시지 설정
        const fieldErrors: PasswordFindFormError = {};
        result.error.errors.forEach((err) => {
          if (err.path[0])
            fieldErrors[err.path[0] as keyof PasswordFindFormError] =
              err.message;
        });
        setFormError(fieldErrors);
        return;
      }

      // ===== 이메일 인증 확인 =====
      if (!isEmailVerified) {
        setFormError((prev) => ({
          ...prev,
          email: '이메일 인증이 필요합니다.',
        }));
        return;
      }

      try {
        // ===== localStorage에서 인증 토큰 확인 =====
        const token = localStorage.getItem('passwordResetToken');
        if (!token) {
          throw new Error('이메일 인증이 필요합니다.');
        }

        // ===== API 호출을 통한 비밀번호 재설정 =====
        await authService.resetPassword(token, signupData.password || '');

        // ===== 성공 시 localStorage 정리 =====
        localStorage.removeItem('passwordResetToken');
        localStorage.removeItem('verifiedEmail');
        localStorage.removeItem('emailVerified');

        // ===== 성공 모달 표시 및 로그인 페이지 이동 =====
        openModal({
          message: '새 비밀번호가 설정되었습니다.\n다시 로그인 해주세요.',
          confirmText: '로그인 하기',
          onConfirm: () => router.push('/'),
        });
      } catch (error) {
        // ===== 에러 처리 =====
        console.error('비밀번호 변경 중 오류:', error);
        openModal({
          title: '비밀번호 변경 실패',
          message: '비밀번호 변경 중 오류가 발생했습니다.\n다시 시도해 주세요.',
          confirmText: '확인',
          type: 'error',
        });
      }
    },
    [signupData, isEmailVerified, openModal, router],
  );

  /**
   * 뒤로 가기 버튼 핸들러
   *
   * 이전 페이지로 이동합니다.
   */
  const handleBackButton = () => {
    router.back();
  };

  // ===== JSX 렌더링 =====
  return (
    <form onSubmit={handleSubmit} className="w-full space-y-0">
      {/* ===== 헤더 섹션 ===== */}
      <div className="relative flex items-center justify-center mb-8">
        {/* 뒤로 가기 버튼 */}
        <div className="absolute left-0" onClick={handleBackButton}>
          <SvgIcon
            name="arrow_left"
            className="cursor-pointer max-md:w-[20px] max-md:h-[20px] w-[40px] h-[40px]"
            color="var(--grayscale-60)"
          />
        </div>
        {/* 제목 */}
        <h1 className="text-[32px] font-bold max-md:text-lg">비밀번호 찾기</h1>
      </div>

      {/* ===== 이메일 인증 섹션 ===== */}
      <div className="mt-6 mb-3 max-md:mb-2">
        <label
          htmlFor="email"
          className="text-grayscale-100 font-semibold max-md:text-sm"
        >
          이메일
          <span className="text-like ml-1">*</span>
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex gap-2 w-full items-center">
          {/* 이메일 입력 필드 */}
          <Input
            id="email"
            name="email"
            type="email"
            value={signupData.email}
            onChange={handleChange}
            disabled={isEmailVerified || isLoading} // 인증 완료 또는 로딩 중일 때 비활성화
            showClearButton
            containerClassName="w-[60%]" // 컨테이너 너비 설정
            required
            placeholder={
              isEmailVerified
                ? '인증이 완료되었습니다.'
                : '이메일을 입력해주세요.'
            }
            error={formError.email}
          />

          {/* 이메일 인증 버튼 */}
          <Button
            type="button"
            onClick={checkEmailAndSendVerification}
            disabled={!signupData.email || isLoading} // 이메일이 없거나 로딩 중일 때 비활성화
            variant={
              isEmailVerified
                ? 'secondary' // 인증 완료: 보조 스타일
                : isEmailSent
                  ? 'outline' // 메일 전송됨: 아웃라인 스타일
                  : 'primary' // 기본: 주요 스타일
            }
            size="md"
            className="w-[40%] max-md:text-sm max-md:px-2 max-md:w-[45%] whitespace-normal break-keep"
          >
            {isLoading
              ? '처리 중...'
              : isEmailVerified
                ? '인증완료'
                : isEmailSent
                  ? '재전송'
                  : '인증 메일 전송'}
          </Button>
        </div>

        {/* ===== 이메일 인증 상태 메시지들 ===== */}

        {/* 이메일 인증 오류 메시지 */}
        {isError && errorMessage && (
          <p className="text-xs text-like">*{errorMessage}</p>
        )}

        {/* 이메일 인증 완료 메시지 */}
        {isEmailVerified && (
          <p className="text-xs text-grayscale-80">*인증이 완료되었습니다.</p>
        )}

        {/* 인증 메일 전송 후 타이머 표시 */}
        {isEmailSent && !isEmailVerified && (
          <div className="text-xs text-grayscale-60 text-right">
            <p>*인증 유효시간 {formatTime(emailTimer)}</p>
          </div>
        )}
      </div>

      {/* ===== 새 비밀번호 입력 섹션 (이메일 인증 완료 후 표시) ===== */}
      {isEmailVerified && (
        <>
          {/* 새 비밀번호 입력 필드 */}
          <Input
            id="password"
            name="password"
            type="password"
            label="새 비밀번호"
            value={signupData.password}
            onChange={handleChange}
            error={formError.password}
            helperText="영문 대소문자, 숫자를 포함해 8자 이상 20자 이하로 입력해주세요."
            required
            showPasswordToggle // 비밀번호 표시/숨김 토글
            showClearButton
            containerClassName="mt-6"
          />

          {/* 새 비밀번호 확인 입력 필드 */}
          <Input
            id="passwordConfirm"
            name="passwordConfirm"
            type="password"
            label="새 비밀번호 재확인"
            value={signupData.passwordConfirm}
            onChange={handleChange}
            error={formError.passwordConfirm}
            required
            showPasswordToggle
            showClearButton
            containerClassName="mt-6"
          />
        </>
      )}

      {/* ===== 제출 버튼 섹션 ===== */}
      <Button
        type="submit"
        disabled={!isFormValid() || isLoading} // 폼이 유효하지 않거나 로딩 중일 때 비활성화
        variant="primary"
        size="lg"
        fullWidth
        className="mt-12 max-md:text-sm max-md:mt-6"
      >
        {isLoading ? '처리 중...' : '비밀번호 변경'}
      </Button>
    </form>
  );
}
