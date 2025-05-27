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

export default function SocialLoginPage() {
  const router = useRouter();
  const { openModal } = useModalStore();
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

      // 먼저 로그인 상태 저장
      setAuth(userData);

      // 로그인 성공 후 계정 연동 팝업
      openModal({
        title: '계정 연동',
        message: '기존 계정과 연동하시겠습니까?',
        confirmText: '연동하기',
        cancelText: '다음에 하기',
        showCancelButton: true,
        onConfirm: async () => {
          try {
            await authService.linkSocialAccount();
            router.push('/posts');
          } catch (error) {
            openModal({
              title: '오류',
              message: '계정 연동 중 오류가 발생했습니다.',
              confirmText: '확인',
            });
          }
        },
        onCancel: () => {
          // 연동하지 않고 그대로 로그인 상태 유지
          router.push('/posts');
        },
      });
    } catch (error: any) {
      setIsError(true);
      if (error.status === 404 || error.status === 401) {
        setErrorMessage('이메일 또는 비밀번호가 잘못 되었습니다.');
      } else {
        setErrorMessage('로그인 중 오류가 발생했습니다');
      }
    } finally {
      setIsLoading(false);
    }
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
    </div>
  );
}
