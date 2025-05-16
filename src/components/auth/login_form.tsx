import { LoginRequest } from '@/types/auth';
import { useAuthStore } from '@/store/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Input from '@/components/common/input';
import { authService } from '@/services/api';
import SvgIcon from '../common/svg_icon';
import Button from '../common/button';

/**
 * 로그인 폼 컴포넌트
 *
 * 주요 기능
 * 1. 이메일/비밀번호 로그인
 * 2. 소셜 로그인 (카카오, 구글)
 * 3. 비회원 접근
 * 4. 회원가입 및 계정 찾기
 */

export default function LoginForm() {
  const router = useRouter();

  const {
    setAuth, // 인증 상태 설정
    isLoading, // 로딩 상태
    setIsLoading, // 로딩 상태 설정
    isError, // 에러 상태
    setIsError, // 에러 상태 설정
    errorMessage, // 에러 메시지
    setErrorMessage, // 에러 메시지 설정
    logout, // 사용자 로그아웃 및 인증 정보 초기화
  } = useAuthStore();

  // 로그인 폼 데이터 상태
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  });

  /**
   * 입력 필드 변경 핸들러
   * - 폼 데이터 업데이트
   * - 에러 상태 초기화
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // 사용자가 입려을 시작하면 이전 에러 메시지 초기화
    if (isError) {
      setIsError(false);
      setErrorMessage(null);
    }
  };

  /**
   * 로그인 폼 제출 핸들러
   * 1. 기본 이벤트 방지
   * 2. 로딩 상태 설정
   * 3. API 호출
   * 4. 인증 정보 저장
   * 5. 페이지 이동
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);

    try {
      const userData = await authService.login(
        formData.email,
        formData.password,
      );

      setAuth(userData);
      router.push('/posts');
    } catch (error) {
      setIsError(true);

      console.log('Error:', error);
      console.log(
        'Error message:',
        error instanceof Error ? error.message : '',
      );

      // 에러 메시지에 따른 처리
      if (error instanceof Error) {
        if (error.message.includes('PASSWORD_NOT_MATCH')) {
          setErrorMessage('비밀번호가 일치하지 않습니다.');
        } else if (error.message.includes('USER_NOT_FOUND')) {
          setErrorMessage('등록되지 않은 이메일입니다.');
        } else {
          setErrorMessage(
            '로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
          );
        }
      } else {
        setErrorMessage(
          '로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 소셜 로그인 핸들러
   * - 소셜 로그인 페이지로 리다이렉트
   */
  const handleSocialLogin = (provider: 'kakao' | 'google') => {
    const url = authService.getSocialLoginUrl(provider);
    window.location.href = url;
  };

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
          error={errorMessage}
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
          error={errorMessage}
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
        <p className="text-center text-grayscale-100 mb-6">소셜 로그인</p>
        <div className="flex justify-center space-x-3 max-md:flex-col max-md:space-x-0 max-md:space-y-3">
          {/* 소셜 로그인 버튼들 */}
          <Button
            variant="outline"
            fullWidth
            onClick={() => handleSocialLogin('kakao')}
            className="max-md:text-sm"
          >
            카카오로 로그인
          </Button>
          <Button
            variant="outline"
            fullWidth
            onClick={() => handleSocialLogin('google')}
            className="max-md:text-sm"
          >
            구글로 로그인
          </Button>
        </div>
      </div>

      {/* 비회원 로그인 */}

      <div className="mt-15 w-full">
        <Button
          fullWidth
          variant="secondary"
          className="max-md:text-sm"
          onClick={() => logout()}
        >
          <Link href="/posts">비회원으로 둘러보기</Link>
        </Button>
      </div>
    </div>
  );
}
