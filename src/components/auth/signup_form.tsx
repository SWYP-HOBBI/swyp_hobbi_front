import { SignupFormData } from '@/types/auth';
import { useSignupStore } from '@/store/signup';
import Input from '@/components/common/input';
import Button from '@/components/common/button';
import { useEmailVerification } from '@/hooks/use_email_verification';
import SvgIcon from '../common/svg_icon';
import { useState, useCallback } from 'react';
import { z } from 'zod';

/**
 * 회원가입 폼 Props 인터페이스
 * @param onSubmit - 회원가입 데이터 제출 핸들러
 * @param onBackButton - 이전 단계로 이동 핸들러
 */
interface SignupFormProps {
  onSubmit: (data: SignupFormData) => void;
  onBackButton: () => void;
}

// Zod 스키마 정의
const SignupSchema = z
  .object({
    username: z
      .string()
      .min(2, '이름은 2자 이상이어야 합니다.')
      .max(10, '이름은 10자 이하여야 합니다.')
      .regex(/^[가-힣a-zA-Z]+$/, '이름은 한글 또는 영문만 입력 가능합니다.'),
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
    path: ['passwordConfirm'],
  });

// 타입 체크: SignupFormData와 zod 스키마 타입 일치 확인 (컴파일 타임)
type SignupZodType = z.infer<typeof SignupSchema>;
// 아래 줄에서 타입이 다르면 에러 발생
// type _Check = SignupZodType extends SignupFormData ? true : never;

// 각 필드별 단일 스키마
const UsernameSchema = z
  .string()
  .min(2, '이름은 2자 이상이어야 합니다.')
  .max(10, '이름은 10자 이하여야 합니다.')
  .regex(/^[가-힣a-zA-Z]+$/, '이름은 한글 또는 영문만 입력 가능합니다.');
const EmailSchema = z.string().email('유효한 이메일을 입력해주세요.');
const PasswordSchema = z
  .string()
  .min(8, '비밀번호는 8자 이상이어야 합니다.')
  .max(20, '비밀번호는 20자 이하여야 합니다.')
  .regex(/[A-Z]/, '영문 대문자를 포함해야 합니다.')
  .regex(/[a-z]/, '영문 소문자를 포함해야 합니다.')
  .regex(/[0-9]/, '숫자를 포함해야 합니다.');

/**
 * 회원가입 폼 컴포넌트
 *
 * 주요 기능
 * 1. 사용자 기본 정보 입력 (이름, 이메일, 비밀번호, 비밀번호 확인)
 * 2. 이메일 인증
 * 3. 실시간 유효성 검사
 * 4. 단계별 회원가입
 */
export default function SignupForm({
  onSubmit,
  onBackButton,
}: SignupFormProps) {
  const {
    signupData,
    updateSignupData,
    isEmailVerified,
    isLoading,
    isError,
    errorMessage,
  } = useSignupStore();

  const { isEmailSent, emailTimer, formatTime, checkEmailAndSendVerification } =
    useEmailVerification();

  // zod 에러 상태
  type SignupFormError = Partial<Record<keyof SignupFormData, string>>;
  const [formError, setFormError] = useState<SignupFormError>({});

  // 입력 필드 변경 핸들러
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      updateSignupData({ [name]: value });

      if (name === 'password' || name === 'passwordConfirm') {
        const nextData = { ...signupData, [name]: value };
        const result = SignupSchema.safeParse(nextData);
        setFormError((prev) => ({
          ...prev,
          password: result.success
            ? undefined
            : result.error.errors.find((e) => e.path[0] === 'password')
                ?.message,
          passwordConfirm: !nextData.passwordConfirm
            ? undefined
            : result.success
              ? undefined
              : result.error.errors.find((e) => e.path[0] === 'passwordConfirm')
                  ?.message,
        }));
        return;
      }

      if (name === 'username') {
        const result = UsernameSchema.safeParse(value);
        setFormError((prev) => ({
          ...prev,
          username: result.success ? undefined : result.error.errors[0].message,
        }));
      } else if (name === 'email') {
        const result = EmailSchema.safeParse(value);
        setFormError((prev) => ({
          ...prev,
          email: result.success ? undefined : result.error.errors[0].message,
        }));
      }
    },
    [signupData, updateSignupData],
  );

  // 폼 유효성 검사 (zod)
  const isFormValid = useCallback(() => {
    const result = SignupSchema.safeParse(signupData);
    return result.success && isEmailVerified;
  }, [signupData, isEmailVerified]);

  // 폼 제출 핸들러
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const result = SignupSchema.safeParse(signupData);
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
      onSubmit(result.data);
    },
    [signupData, isEmailVerified, onSubmit],
  );

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-0">
      {/* 헤더 */}
      <div className="relative flex items-center justify-center mb-8">
        <div className="absolute left-0" onClick={onBackButton}>
          <SvgIcon
            name="arrow_left"
            className="cursor-pointer max-md:w-[20px] max-md:h-[20px] w-[40px] h-[40px]"
            color="var(--grayscale-60)"
          />
        </div>
        <h1 className="text-[32px] font-bold max-md:text-lg">회원가입</h1>
      </div>

      {/* 이름 입력 */}
      <div className="space-y-2">
        <Input
          id="username"
          name="username"
          type="text"
          label="이름"
          value={signupData.username}
          onChange={handleChange}
          showClearButton
          required
          error={formError.username}
        />
        {formError.username && (
          <p className="text-xs text-like mt-2 max-md:text-[8px]">
            *{formError.username}
          </p>
        )}
      </div>

      {/* 이메일 인증 */}
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
          {/* 이메일 입력 */}
          <Input
            id="email"
            name="email"
            type="email"
            value={signupData.email}
            onChange={handleChange}
            disabled={isEmailVerified || isLoading}
            showClearButton
            containerClassName="w-[60%]"
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
            disabled={!signupData.email || isLoading}
            variant={
              isEmailVerified
                ? 'secondary'
                : isEmailSent
                  ? 'outline'
                  : 'primary'
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

        {/* 이메일 인증 오류 */}
        {isError && errorMessage && (
          <p className="text-xs text-like">*{errorMessage}</p>
        )}

        {/* 이메일 인증 완료 */}
        {isEmailVerified && (
          <p className="text-xs text-grayscale-80">*인증이 완료되었습니다.</p>
        )}

        {isEmailSent && !isEmailVerified && (
          <div className="text-xs text-grayscale-60 text-right">
            <p>*인증 유효시간 {formatTime(emailTimer)}</p>
          </div>
        )}
      </div>

      {/* 비밀번호 입력 */}
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
        showPasswordToggle
        showClearButton
        containerClassName="mt-6"
      />

      {/* 비밀번호 확인 */}
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
        containerClassName="mt-6"
      />

      {/* 제출 버튼 */}
      <Button
        type="submit"
        disabled={!isFormValid() || isLoading}
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
