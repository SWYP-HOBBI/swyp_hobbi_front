'use client';

import { useSignupStore } from '@/store/signup';
import Input from '@/components/common/input';
import Button from '@/components/common/button';
import { useEmailVerification } from '@/hooks/use_email_verification';
import SvgIcon from '../common/svg_icon';
import {
  getPasswordConfirmError,
  getPasswordError,
} from '@/utils/password_validation';
import { authService } from '@/services/api';
import { useRouter } from 'next/navigation';

export default function PasswordFind({}) {
  const {
    signupData,
    updateSignupData,
    isEmailVerified,
    isLoading,
    isError,
    errorMessage,
  } = useSignupStore();

  const router = useRouter();

  const { isEmailSent, emailTimer, formatTime, checkEmailAndSendVerification } =
    useEmailVerification({
      sendVerificationEmail: authService.sendPasswordFindEmail,
      skipDuplicateCheck: true,
    });

  /**
   * 입력 필드 변경 핸들러
   * 모든 입력 필드의 변경사항을 Zustand 스토어에 업데이트
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateSignupData({ [name]: value });
  };

  /**
   * 폼 유효성 검사
   * 모든 입력 필드가 유효한 경우 true 반환
   */
  const isFormValid = () => {
    return (
      signupData?.email?.trim() !== '' &&
      signupData?.password?.trim() !== '' &&
      signupData?.passwordConfirm?.trim() !== '' &&
      !getPasswordError(signupData.password || '') &&
      !getPasswordConfirmError(
        signupData.password || '',
        signupData.passwordConfirm || '',
      ) &&
      isEmailVerified
    );
  };

  /**
   * 폼 제출 핸들러
   * 유효성 검사 후 상위 컴포넌트로 데이터 전달
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid()) {
      try {
        const token = localStorage.getItem('passwordResetToken');

        if (!token) {
          throw new Error('이메일 인증이 필요합니다.');
        }

        await authService.resetPassword(token, signupData.password || '');
        localStorage.removeItem('passwordResetToken'); // 사용한 토큰 제거
        router.push('/');
      } catch (error) {
        console.error('비밀번호 변경 중 오류:', error);
      }
    }
  };

  const handleBackButton = () => {
    router.back();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-0">
      {/* 헤더 */}
      <div className="relative flex items-center justify-center mb-8">
        <div className="absolute left-0" onClick={handleBackButton}>
          <SvgIcon
            name="arrow_left"
            className="cursor-pointer max-md:w-[20px] max-md:h-[20px] w-[40px] h-[40px]"
            color="var(--grayscale-60)"
          />
        </div>
        <h1 className="text-[32px] font-bold max-md:text-lg">비밀번호 찾기</h1>
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
          <p className="text-xs text-primary">*인증이 완료되었습니다.</p>
        )}

        {isEmailSent && !isEmailVerified && (
          <div className="text-xs text-grayscale-60 text-right">
            <p>*인증 유효시간 {formatTime(emailTimer)}</p>
          </div>
        )}
      </div>

      {/* 비밀번호 입력 - 이메일 인증이 완료된 경우에만 표시 */}
      {isEmailVerified && (
        <>
          <Input
            id="password"
            name="password"
            type="password"
            label="새 비밀번호"
            value={signupData.password}
            onChange={handleChange}
            error={getPasswordError(signupData.password || '')}
            helperText="영문 대소문자, 숫자를 포함해 8자 이상 20자 이하로 입력해주세요."
            required
            showPasswordToggle
            showClearButton
            containerClassName="mt-6"
          />

          <Input
            id="passwordConfirm"
            name="passwordConfirm"
            type="password"
            label="새 비밀번호 재확인"
            value={signupData.passwordConfirm}
            onChange={handleChange}
            error={getPasswordConfirmError(
              signupData.password || '',
              signupData.passwordConfirm || '',
            )}
            required
            showPasswordToggle
            showClearButton
            containerClassName="mt-6"
          />
        </>
      )}

      {/* 제출 버튼 */}
      <Button
        type="submit"
        disabled={!isFormValid() || isLoading}
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
