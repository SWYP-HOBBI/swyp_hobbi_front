import { LoginRequest } from '@/types/auth';
import { useAuthStore } from '@/store/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import Input from '@/components/common/input';
import { authService } from '@/services/api';
import SvgIcon from '../common/svg_icon';
import Button from '../common/button';
import SocialButton from '../common/social_button';
import { useModalStore } from '@/store/modal';
import { z } from 'zod';

/**
 * 로그인 폼 컴포넌트
 *
 * 주요 기능
 * 1. 이메일/비밀번호 로그인
 * 2. 소셜 로그인 (카카오, 구글)
 * 3. 비회원 접근
 * 4. 회원가입 및 계정 찾기
 */

// zod 스키마 정의
const LoginSchema = z.object({
  email: z.string().email('유효한 이메일을 입력해주세요.'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다.'),
});
type LoginFormError = Partial<Record<'email' | 'password', string>>;

export default function LoginForm() {
  const router = useRouter();
  const { openModal } = useModalStore();

  const {
    setAuth, // 인증 상태 설정
    isLoading, // 로딩 상태
    setIsLoading, // 로딩 상태 설정
    isError, // 에러 상태
    setIsError, // 에러 상태 설정
    errorMessage, // 에러 메시지
    setErrorMessage, // 에러 메시지 설정
    setPublicUser, // 비회원 상태 설정
  } = useAuthStore();

  // 로그인 폼 데이터 상태
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  });
  // zod 에러 상태
  const [formError, setFormError] = useState<LoginFormError>({});

  /**
   * 입력 필드 변경 핸들러
   * - 폼 데이터 업데이트
   * - 에러 상태 초기화
   */
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      // 사용자가 입력을 시작하면 이전 에러 메시지 초기화
      if (isError) {
        setIsError(false);
        setErrorMessage(null);
      }
      // zod 실시간 유효성 검사
      if (name === 'email') {
        const result = LoginSchema.shape.email.safeParse(value);
        setFormError((prev) => ({
          ...prev,
          email: result.success ? undefined : result.error.errors[0].message,
        }));
      } else if (name === 'password') {
        const result = LoginSchema.shape.password.safeParse(value);
        setFormError((prev) => ({
          ...prev,
          password: result.success ? undefined : result.error.errors[0].message,
        }));
      }
    },
    [isError, setIsError, setErrorMessage],
  );

  /**
   * 로그인 폼 제출 핸들러
   * 1. 기본 이벤트 방지
   * 2. 로딩 상태 설정
   * 3. API 호출
   * 4. 인증 정보 저장
   * 5. 페이지 이동
   */
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setIsLoading(true);
      setIsError(false);
      setErrorMessage(null);

      // zod 전체 폼 유효성 검사
      const result = LoginSchema.safeParse(formData);
      if (!result.success) {
        const fieldErrors: LoginFormError = {};
        result.error.errors.forEach((err) => {
          if (err.path[0])
            fieldErrors[err.path[0] as keyof LoginFormError] = err.message;
        });
        setFormError(fieldErrors);
        setIsLoading(false);
        return;
      }

      try {
        const userData = await authService.login(
          formData.email,
          formData.password,
        );
        setAuth(userData);
        router.push('/posts');
      } catch (error: any) {
        setIsError(true);
        if (error.data?.errorCode === 'USER_NOT_FOUND') {
          setErrorMessage(
            '등록되지 않은 이메일입니다. 회원가입 후 이용해 주세요.',
          );
        } else if (error.status === 401) {
          setErrorMessage(
            '비밀번호가 일치하지 않습니다. 비밀번호를 다시 확인해 주세요.',
          );
        } else {
          setErrorMessage('로그인 중 오류가 발생했습니다');
        }
      } finally {
        setIsLoading(false);
      }
    },
    [formData, setIsLoading, setIsError, setErrorMessage, setAuth, router],
  );

  /**
   * 소셜 로그인 핸들러
   * - 소셜 로그인 URL로 리다이렉트
   * - 콜백에서 연동 여부에 따른 팝업 표시
   */
  const handleSocialLogin = async (provider: 'kakao' | 'google') => {
    try {
      // 소셜 로그인 URL 가져오기
      const loginUrl = authService.getSocialLoginUrl(provider);

      // 소셜 로그인 페이지로 리다이렉트
      window.location.href = loginUrl;
    } catch (error: any) {
      console.error('소셜 로그인 에러:', error);
      openModal({
        title: '오류',
        message: '소셜 로그인 중 오류가 발생했습니다.',
        confirmText: '확인',
      });
    }
  };

  // const handleSocialLogin = (provider: 'kakao' | 'google') => {
  //   openModal({
  //     title: '준비 중인 기능입니다',
  //     message: `${provider === 'kakao' ? '카카오' : '구글'} 로그인은 현재 개발 중입니다. 잠시만 기다려 주세요.`,
  //     confirmText: '확인',
  //   });
  // };

  return (
    <div className="w-full flex flex-col items-center">
      {/* 로고 */}
      <SvgIcon
        name="logo"
        className="max-md:w-[150px] max-md:h-[44px] w-[240px] h-[70px]"
      />

      {/* 로그인 */}
      <form
        onSubmit={handleSubmit}
        className="w-full space-y-8 mt-12 max-md:space-y-3"
      >
        {/* 이메일 입력 */}
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="이메일"
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading}
          required
          showClearButton
          error={formError.email || errorMessage}
        />

        {/* 비밀번호 입력 */}
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="비밀번호"
          value={formData.password}
          onChange={handleChange}
          disabled={isLoading}
          required
          showPasswordToggle
          showClearButton
          error={formError.password || errorMessage}
        />

        {/* 로그인 버튼 */}
        <Button
          type="submit"
          disabled={isLoading}
          fullWidth
          className="max-md:text-sm"
        >
          로그인
        </Button>
      </form>

      {/* 아이디/비밀번호 찾기 */}
      <div className="flex justify-end space-x-4 w-full mt-3">
        <Link href="/find_password" className="text-xs text-grayscale-100">
          비밀번호 찾기
        </Link>
        <Link href="/signup" className="text-xs text-grayscale-100">
          회원가입
        </Link>
      </div>

      {/* 소셜 로그인 섹션 */}
      <div className="mt-12 w-full">
        <div className="w-full flex items-center gap-2 mb-6">
          <div className="h-[1px] flex-1 bg-grayscale-80" />
          <p className="text-grayscale-100">소셜 로그인</p>
          <div className="h-[1px] flex-1 bg-grayscale-80" />
        </div>
        <div className="flex justify-center space-x-3 max-md:flex-col max-md:space-x-0 max-md:space-y-3">
          <SocialButton
            provider="kakao"
            onClick={() => handleSocialLogin('kakao')}
            fullWidth
            className="max-md:text-sm"
            disabled
          />
          <SocialButton
            provider="google"
            onClick={() => handleSocialLogin('google')}
            fullWidth
            className="max-md:text-sm"
            disabled
          />
        </div>
      </div>

      {/* 비회원 로그인 */}

      <div className="mt-15 w-full">
        <Button
          fullWidth
          variant="secondary"
          className="max-md:text-sm"
          onClick={() => setPublicUser()}
        >
          <Link href="/posts">비회원으로 둘러보기</Link>
        </Button>
      </div>
    </div>
  );
}
