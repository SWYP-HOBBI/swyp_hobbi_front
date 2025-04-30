import { LoginRequest } from '@/types/auth';
import { useAuthStore } from '@/store/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Input from '@/components/common/input';
import { authService } from '@/services/api';
import SvgIcon from '../common/svg_icon';
import Button from '../common/button';

export default function LoginForm() {
  const router = useRouter();
  const {
    setAuth,
    isLoading,
    setIsLoading,
    isError,
    setIsError,
    errorMessage,
    setErrorMessage,
  } = useAuthStore();
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // 입력 시 에러 초기화
    if (isError) {
      setIsError(false);
      setErrorMessage(null);
    }
  };

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

      setAuth({
        accessToken: userData.accessToken,
        refreshToken: userData.refreshToken,
        userId: userData.userId,
        hobbyTags: userData.hobbyTags,
      });

      router.push('/posts');
    } catch (error) {
      setIsError(true);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : '로그인 중 오류가 발생했습니다.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <SvgIcon name="logo" width={240} height={70} />

      {/* 로그인 */}
      <form onSubmit={handleSubmit} className="w-full space-y-8 mt-12">
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

        <Button type="submit" disabled={isLoading} fullWidth>
          로그인
        </Button>
      </form>

      {/* 아이디/비밀번호 찾기 */}
      <div className="flex justify-end space-x-4 w-full mt-3">
        <Link href="/find-account" className="text-xs text-grayscale-100">
          아이디/비밀번호 찾기
        </Link>
        <Link href="/signup" className="text-xs text-grayscale-100">
          회원가입
        </Link>
      </div>

      {/* 소셜 로그인 섹션 */}
      <div className="mt-10 w-full">
        <p className="text-center text-grayscale-100 mb-11">소셜 로그인</p>
        <div className="flex justify-center space-x-3">
          {/* 소셜 로그인 버튼들 */}
          <Button variant="outline" size="sm" fullWidth>
            카카오로 로그인
          </Button>
          <Button variant="outline" size="sm" fullWidth>
            구글로 로그인
          </Button>
        </div>
      </div>

      {/* 비회원 로그인 */}
      <div className="mt-15 w-full">
        <Button fullWidth variant="secondary">
          <Link href="/posts">비회원으로 둘러보기</Link>
        </Button>
      </div>
    </div>
  );
}
