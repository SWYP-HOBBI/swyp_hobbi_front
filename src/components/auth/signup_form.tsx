import { SignupFormData } from '@/types/auth';
import { useSignupStore } from '@/store/signup';
import { useEffect } from 'react';
import Input from '@/components/common/input';
import Button from '@/components/common/button';
import { useEmailVerification } from '@/hooks/use_email_verification';
import {
  validatePassword,
  validatePasswordComplexity,
  validatePasswordLength,
} from '@/utils/password_validation';
import SvgIcon from '../common/svg_icon';

interface SignupFormProps {
  onSubmit: (data: SignupFormData) => void;
  onBackButton: () => void;
}

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

  // 폼 진입 시 비밀번호 필드 초기화
  useEffect(() => {
    updateSignupData({ password: '', passwordConfirm: '' });
  }, []);

  // 입력 필드 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateSignupData({ [name]: value });
  };

  // 비밀번호 유효성 검사
  const getPasswordError = () => {
    if (!signupData.password) return undefined;

    const lengthCheck = validatePasswordLength(signupData.password);
    if (!lengthCheck.isValid) return lengthCheck.message;

    const complexityCheck = validatePasswordComplexity(signupData.password);
    if (!complexityCheck.isValid) return complexityCheck.message;

    return undefined;
  };

  // 비밀번호 확인 유효성 검사
  const getPasswordConfirmError = () => {
    if (!signupData.passwordConfirm) return undefined;

    const validation = validatePassword(
      signupData.password,
      signupData.passwordConfirm,
    );
    return validation.message;
  };

  // 폼 유효성 검사
  const isFormValid = () => {
    return (
      signupData?.username?.trim() !== '' &&
      signupData?.email?.trim() !== '' &&
      signupData?.password?.trim() !== '' &&
      signupData?.passwordConfirm?.trim() !== '' &&
      !getPasswordError() &&
      !getPasswordConfirmError() &&
      isEmailVerified
    );
  };

  // 폼 제출 핸들러
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid()) {
      onSubmit({
        username: signupData.username,
        email: signupData.email,
        password: signupData.password,
        passwordConfirm: signupData.passwordConfirm,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-0">
      <div className="relative flex items-center justify-center mb-8">
        <div className="absolute left-0" onClick={onBackButton}>
          <SvgIcon
            name="arrow_left"
            size={40}
            className="cursor-pointer"
            color="var(--grayscale-60)"
          />
        </div>
        <h1 className="text-[32px] font-bold">회원가입</h1>
      </div>

      {/* 이름 입력 */}
      <Input
        id="username"
        name="username"
        type="text"
        label="이름"
        value={signupData.username}
        onChange={handleChange}
        showClearButton
        required
      />

      {/* 이메일 입력 */}
      <div className="mt-6 mb-3">
        <label htmlFor="email" className="text-grayscale-100 font-semibold">
          이메일
          <span className="text-like ml-1">*</span>
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex gap-2 w-full">
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
          />
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
            className="w-[40%]"
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

        {isError && errorMessage && (
          <p className="text-xs text-like">*{errorMessage}</p>
        )}

        {isEmailVerified && (
          <p className="text-xs text-primary">*인증이 완료되었습니다.</p>
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
        error={getPasswordError()}
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
        error={getPasswordConfirmError()}
        required
        showPasswordToggle
        showClearButton
        containerClassName="mt-6"
      />

      <Button
        type="submit"
        disabled={!isFormValid() || isLoading}
        variant="primary"
        size="lg"
        fullWidth
        className="mt-12"
      >
        {isLoading ? '처리 중...' : '다음'}
      </Button>
    </form>
  );
}
