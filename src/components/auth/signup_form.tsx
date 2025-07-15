import { SignupFormData } from '@/types/auth';
import { useSignupStore } from '@/store/signup';
import Input from '@/components/common/input';
import Button from '@/components/common/button';
import { useEmailVerification } from '@/hooks/use_email_verification';
import SvgIcon from '../common/svg_icon';
import { useState, useCallback } from 'react';
import { z } from 'zod';
import { authService } from '@/services/api';
import VerificationCodeInput from '@/components/common/verification_code_input';

/**
 * 회원가입 폼 Props 인터페이스
 *
 * @param onSubmit - 회원가입 데이터가 유효성 검사를 통과했을 때 호출되는 콜백 함수
 *                   부모 컴포넌트에서 다음 단계로 진행하는 로직을 처리
 * @param onBackButton - 이전 단계로 이동할 때 호출되는 콜백 함수
 *                       회원가입 프로세스에서 뒤로 가기 기능을 제공
 */
interface SignupFormProps {
  onSubmit: (data: Omit<SignupFormData, 'verificationCode'>) => void;
  onBackButton: () => void;
}

// ===== ZOD 스키마 정의 =====

/**
 * 회원가입 폼 전체 데이터 유효성 검사를 위한 Zod 스키마
 *
 * 각 필드별 검증 규칙:
 * - username: 2-10자, 한글/영문만 허용
 * - email: 유효한 이메일 형식
 * - password: 8-20자, 영문 대소문자+숫자 포함
 * - passwordConfirm: password와 일치 여부 확인
 */
const SignupSchema = z
  .object({
    username: z
      .string()
      .min(2, '* 이름은 2자 이상이어야 합니다.')
      .max(10, '* 이름은 10자 이하여야 합니다.')
      .regex(/^[가-힣a-zA-Z]+$/, '* 이름은 한글 또는 영문만 입력 가능합니다.'),
    email: z.string().email('* 유효한 이메일을 입력해주세요.'),
    password: z
      .string()
      .min(8, '* 비밀번호는 8자 이상이어야 합니다.')
      .max(20, '* 비밀번호는 20자 이하여야 합니다.')
      .regex(/[A-Z]/, '* 영문 대문자를 포함해야 합니다.')
      .regex(/[a-z]/, '* 영문 소문자를 포함해야 합니다.')
      .regex(/[0-9]/, '* 숫자를 포함해야 합니다.'),
    passwordConfirm: z.string(),
    verificationCode: z.string().optional(),
    // isEmailVerified는 실제 데이터에는 없지만, refine에서 참조를 위해 추가
    isEmailVerified: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.isEmailVerified ||
      (data.verificationCode && data.verificationCode.length === 6),
    {
      message: '* 인증 코드는 6자리여야 합니다.',
      path: ['verificationCode'],
    },
  )
  .refine((data) => data.password === data.passwordConfirm, {
    message: '* 비밀번호가 일치하지 않습니다.',
    path: ['passwordConfirm'],
  });

/**
 * 회원가입 폼 메인 컴포넌트
 *
 * 사용자의 회원가입 정보를 수집하고 유효성을 검사하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 사용자 기본 정보 입력 (이름, 이메일, 비밀번호, 비밀번호 확인)
 * 2. 이메일 인증 시스템 (인증 메일 전송, 재전송, 타이머)
 * 3. 실시간 유효성 검사 (Zod 스키마 기반)
 * 4. 단계별 회원가입 프로세스 지원
 *
 * 기술적 특징:
 * - Zod를 사용한 강력한 유효성 검사
 * - Zustand를 통한 전역 상태 관리
 * - 커스텀 훅을 통한 이메일 인증 로직 분리
 * - 실시간 에러 피드백
 * - 반응형 디자인 (모바일/데스크톱)
 */
export default function SignupForm({
  onSubmit,
  onBackButton,
}: SignupFormProps) {
  // ===== 스토어 및 훅 초기화 =====

  /**
   * 회원가입 관련 상태와 액션을 가져오는 스토어
   */
  const {
    signupData, // 회원가입 폼 데이터
    updateSignupData, // 폼 데이터 업데이트 함수
    isLoading, // 로딩 상태
    isError, // 에러 발생 여부
    errorMessage, // 에러 메시지
    setIsLoading, // 로딩 상태 설정
    setIsError, // 에러 상태 설정
    setErrorMessage, // 에러 메시지 설정
    setIsEmailVerified, // 이메일 인증 상태 설정
    setIsEmailSent, // 이메일 발송 상태 설정
    setEmailTimer, // 타이머 설정
  } = useSignupStore();

  /**
   * 이메일 인증 관련 기능을 제공하는 커스텀 훅
   */
  const {
    isEmailVerified,
    isEmailSent,
    emailTimer,
    formatTime,
    checkEmailAndSendVerification,
  } = useEmailVerification();

  // ===== 로컬 상태 관리 =====

  /**
   * Zod 유효성 검사 에러 상태
   * 각 필드별 실시간 유효성 검사 결과를 저장
   */
  type SignupFormError = Partial<Record<keyof SignupFormData, string>>;
  const [formError, setFormError] = useState<SignupFormError>({});

  // ===== 이벤트 핸들러 함수들 =====

  /**
   * 입력 필드 변경 핸들러
   *
   * 사용자가 입력할 때마다 호출되며 다음 작업을 수행합니다:
   * 1. 스토어의 폼 데이터 업데이트
   * 2. 실시간 유효성 검사 수행
   * 3. 에러 상태 업데이트
   *
   * @param e - 입력 이벤트 객체
   */
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;

      // 스토어의 폼 데이터 업데이트
      updateSignupData({ [name]: value });

      const nextData = { ...signupData, [name]: value };
      const result = SignupSchema.safeParse({
        ...nextData,
        isEmailVerified,
      } as any);

      // ===== 비밀번호 관련 필드 특별 처리 =====
      if (name === 'password' || name === 'passwordConfirm') {
        // 비밀번호 변경 시 전체 스키마로 검증 (일치 여부 확인을 위해)

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
      if (name === 'username') {
        setFormError((prev) => ({
          ...prev,
          username: result.success
            ? undefined
            : result.error.errors.find((e) => e.path[0] === 'username')
                ?.message,
        }));
      } else if (name === 'email') {
        setFormError((prev) => ({
          ...prev,
          email: result.success
            ? undefined
            : result.error.errors.find((e) => e.path[0] === 'email')?.message,
        }));
      }
    },
    [signupData, updateSignupData, isEmailVerified],
  );

  /**
   * 폼 전체 유효성 검사 함수
   *
   * 제출 버튼 활성화 여부를 결정하는 데 사용됩니다.
   *
   * @returns {boolean} 폼이 유효하고 이메일이 인증되었는지 여부
   */
  const isFormValid = useCallback(() => {
    const result = SignupSchema.safeParse({
      ...signupData,
      isEmailVerified,
    } as any);
    return result.success && isEmailVerified;
  }, [signupData, isEmailVerified]);
  /**
   * 인증 코드 확인 핸들러
   *
   * 사용자가 입력한 6자리 인증 코드를 서버에 전송하여 이메일 인증을 완료합니다.
   *
   * 처리 과정:
   * 1. 인증 코드 유효성 검사
   * 2. 서버에 인증 코드 전송
   * 3. 인증 성공 시 이메일 인증 상태 업데이트
   * 4. 에러 처리 및 상태 정리
   */
  const handleVerifyCode = useCallback(async () => {
    if (
      !signupData.verificationCode ||
      signupData.verificationCode.length !== 6
    ) {
      setFormError((prev) => ({
        ...prev,
        verificationCode: '* 6자리 인증 코드를 입력해주세요.',
      }));
      return;
    }

    try {
      setIsLoading(true);
      setIsError(false);
      setErrorMessage(null);

      // 인증 코드 확인 API 호출
      await authService.verifyEmail(
        signupData.verificationCode,
        signupData.email,
      );

      // 인증 성공 시 상태 업데이트
      setIsEmailVerified(true);
      setIsEmailSent(false);
      setEmailTimer(0);

      // 인증 코드 필드 초기화
      updateSignupData({ verificationCode: '' });

      // 에러 상태 초기화
      setFormError((prev) => ({
        ...prev,
        verificationCode: undefined,
      }));
    } catch (error) {
      setIsError(true);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : '인증 코드 확인 중 오류가 발생했습니다.',
      );
      setFormError((prev) => ({
        ...prev,
        verificationCode: '* 인증 코드가 올바르지 않습니다.',
      }));
    } finally {
      setIsLoading(false);
    }
  }, [
    signupData.verificationCode,
    signupData.email,
    setIsLoading,
    setIsError,
    setErrorMessage,
    setIsEmailVerified,
    setIsEmailSent,
    setEmailTimer,
    updateSignupData,
  ]);

  /**
   * 폼 제출 핸들러
   *
   * 회원가입 데이터를 최종 검증하고 부모 컴포넌트에 전달합니다.
   *
   * 검증 단계:
   * 1. Zod 스키마를 통한 전체 데이터 유효성 검사
   * 2. 이메일 인증 완료 여부 확인
   * 3. 검증 통과 시 부모 컴포넌트에 데이터 전달
   *
   * @param e - 폼 제출 이벤트 객체
   */
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const result = SignupSchema.safeParse({
        ...signupData,
        verificationCode: signupData.verificationCode ?? '',
        isEmailVerified,
      } as any);
      if (!result.success) {
        const fieldErrors: SignupFormError = {};
        result.error.errors.forEach((err) => {
          if (err.path[0])
            fieldErrors[err.path[0] as keyof SignupFormData] = err.message;
        });
        setFormError(fieldErrors);
        return;
      }
      if (!isEmailVerified) {
        setFormError((prev) => ({
          ...prev,
          email: '이메일 인증이 필요합니다.',
        }));
        return;
      }
      // 불필요한 필드 제거 후 전달
      const { isEmailVerified: _, verificationCode: __, ...rest } = result.data;
      onSubmit(rest);
    },
    [signupData, isEmailVerified, onSubmit],
  );

  // ===== JSX 렌더링 =====
  return (
    <form onSubmit={handleSubmit} className="w-full space-y-0">
      {/* ===== 헤더 섹션 ===== */}
      <div className="relative flex items-center justify-center mb-8">
        {/* 뒤로 가기 버튼 */}
        <div className="absolute left-0" onClick={onBackButton}>
          <SvgIcon
            name="arrow_left"
            className="cursor-pointer max-md:w-[20px] max-md:h-[20px] w-[40px] h-[40px]"
            color="var(--grayscale-60)"
          />
        </div>
        {/* 제목 */}
        <h1 className="text-[32px] font-bold max-md:text-lg">회원가입</h1>
      </div>

      {/* ===== 이름 입력 섹션 ===== */}
      <div className="space-y-2">
        <Input
          id="username"
          name="username"
          type="text"
          label="이름"
          value={signupData.username}
          onChange={handleChange}
          showClearButton // 입력값 지우기 버튼
          required
          error={formError.username}
        />
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
          <p className="text-xs text-grayscale-50 text-right">
            *메일을 발송했습니다. 인증 유효시간 {formatTime(emailTimer)}
          </p>
        )}

        {/* ===== 인증 코드 입력 섹션 ===== */}
        {isEmailSent && !isEmailVerified && (
          <div className="flex gap-2 w-full items-center mt-4 justify-between">
            {/* 인증 코드 입력 필드 */}
            <VerificationCodeInput
              value={signupData.verificationCode || ''}
              onChange={(val) => updateSignupData({ verificationCode: val })}
              disabled={isLoading}
            />
            {/* 인증 확인 버튼 */}
            <Button
              type="button"
              onClick={handleVerifyCode}
              disabled={
                !signupData.verificationCode ||
                signupData.verificationCode.length !== 6 ||
                isLoading
              }
              variant="outline"
              size="md"
              className="w-[40%] max-md:text-sm max-md:px-2 max-md:w-[45%] whitespace-normal break-keep"
            >
              {isLoading ? '처리 중...' : '인증 확인'}
            </Button>
          </div>
        )}
        <p className="text-xs text-like">{formError.verificationCode}</p>
      </div>

      {/* ===== 비밀번호 입력 섹션 ===== */}
      <div className="mt-6">
        <Input
          id="password"
          name="password"
          type="password"
          label="비밀번호"
          value={signupData.password}
          onChange={handleChange}
          error={formError.password}
          helperText="영문 대소문자, 숫자를 포함해 8자 이상 20자 이하로 입력해주세요."
          required
          showPasswordToggle // 비밀번호 표시/숨김 토글
          showClearButton
        />
      </div>

      {/* ===== 비밀번호 확인 섹션 ===== */}
      <div className="mt-6">
        <Input
          id="passwordConfirm"
          name="passwordConfirm"
          type="password"
          label="비밀번호 재확인"
          value={signupData.passwordConfirm}
          onChange={handleChange}
          error={formError.passwordConfirm}
          required
          showPasswordToggle
          showClearButton
        />
      </div>

      {/* ===== 제출 버튼 섹션 ===== */}
      <Button
        type="submit"
        disabled={!isFormValid() || isLoading} // 폼이 유효하지 않거나 로딩 중일 때 비활성화
        variant="primary"
        size="lg"
        fullWidth
        className="mt-12 max-md:text-sm max-md:mt-6"
      >
        {isLoading ? '처리 중...' : '다음'}
      </Button>
    </form>
  );
}
