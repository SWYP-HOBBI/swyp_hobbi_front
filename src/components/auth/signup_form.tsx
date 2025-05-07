import { SignupFormData } from '@/types/auth';
import { useSignupStore } from '@/store/signup';
import Input from '@/components/common/input';
import Button from '@/components/common/button';
import { useEmailVerification } from '@/hooks/use_email_verification';
import SvgIcon from '../common/svg_icon';
import {
  getPasswordConfirmError,
  getPasswordError,
} from '@/utils/password_validation';

/**
 * 회원가입 폼 Props 인터페이스
 * @param onSubmit - 회원가입 데이터 제출 핸들러
 * @param onBackButton - 이전 단계로 이동 핸들러
 */
interface SignupFormProps {
  onSubmit: (data: SignupFormData) => void;
  onBackButton: () => void;
}

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
    signupData, // 회원가입 데이터
    updateSignupData, // 회원가입 데이터 업데이트
    isEmailVerified, // 이메일 인증 상태
    isLoading, // 로딩 상태
    isError, // 에러 상태
    errorMessage, // 에러 메시지
  } = useSignupStore();

  const {
    isEmailSent, // 이메일 인증 메일 발송 상태
    emailTimer, // 이메일 인증 타이머
    formatTime, // 타이머 시간 포맷
    checkEmailAndSendVerification, // 이메일 중복 확인 및 인증 메일 발송
  } = useEmailVerification();

  // // 폼 진입 시 비밀번호 필드 초기화
  // useEffect(() => {
  //   updateSignupData({ password: '', passwordConfirm: '' });
  // }, []);

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
      signupData?.username?.trim() !== '' &&
      signupData?.email?.trim() !== '' &&
      signupData?.password?.trim() !== '' &&
      signupData?.passwordConfirm?.trim() !== '' &&
      // 비밀번호 유효성 검사
      !getPasswordError(signupData.password || '') &&
      // 비밀번호 확인 일치 여부
      !getPasswordConfirmError(
        signupData.password || '',
        signupData.passwordConfirm || '',
      ) &&
      // 이메일 인증 완료 여부
      isEmailVerified
    );
  };

  /**
   * 폼 제출 핸들러
   * 유효성 검사 후 상위 컴포넌트로 데이터 전달
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid()) {
      onSubmit({
        username: signupData.username || '',
        email: signupData.email || '',
        password: signupData.password || '',
        passwordConfirm: signupData.passwordConfirm || '',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-0">
      {/* 헤더 */}
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

      {/* 이메일 인증 */}
      <div className="mt-6 mb-3">
        <label htmlFor="email" className="text-grayscale-100 font-semibold">
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

      {/* 비밀번호 입력 */}
      <Input
        id="password"
        name="password"
        type="password"
        label="비밀번호"
        value={signupData.password}
        onChange={handleChange}
        error={getPasswordError(signupData.password || '')}
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
        error={getPasswordConfirmError(
          signupData.password || '',
          signupData.passwordConfirm || '',
        )}
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
        className="mt-12"
      >
        {isLoading ? '처리 중...' : '다음'}
      </Button>
    </form>
  );
}
