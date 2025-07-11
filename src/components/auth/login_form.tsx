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
 * 로그인 폼 컴포넌트 (LoginForm)
 *
 * 이 컴포넌트는 사용자의 로그인 기능을 담당하는 핵심 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 이메일/비밀번호 로그인 - 기본 로그인 방식
 * 2. 소셜 로그인 - 카카오, 구글 OAuth 연동
 * 3. 비회원 접근 - 로그인 없이 서비스 이용 가능
 * 4. 회원가입 및 비밀번호 찾기 링크 제공
 *
 * 기술적 특징:
 * - Zod를 사용한 실시간 폼 유효성 검사
 * - Zustand를 통한 전역 상태 관리
 * - Next.js App Router 사용
 * - TypeScript로 타입 안정성 보장
 * - 반응형 디자인 (모바일/데스크톱)
 */

// ===== ZOD 스키마 정의 =====
/**
 * 로그인 폼 데이터 유효성 검사를 위한 Zod 스키마
 *
 * email: 이메일 형식 검증
 * password: 최소 8자 이상 검증
 */
const LoginSchema = z.object({
  email: z.string().email('유효한 이메일을 입력해주세요.'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다.'),
});

/**
 * 폼 에러 타입 정의
 * 각 필드별 에러 메시지를 저장하는 객체 타입
 */
type LoginFormError = Partial<Record<'email' | 'password', string>>;

/**
 * 로그인 폼 메인 컴포넌트
 */
export default function LoginForm() {
  // ===== 훅 및 스토어 초기화 =====
  const router = useRouter(); // Next.js 라우터
  const { openModal } = useModalStore(); // 모달 스토어

  // ===== 인증 스토어에서 필요한 상태와 액션 가져오기 =====
  const {
    setAuth, // 인증 성공 시 사용자 정보 저장
    isLoading, // 로그인 진행 중 로딩 상태
    setIsLoading, // 로딩 상태 변경 함수
    isError, // 에러 발생 여부
    setIsError, // 에러 상태 변경 함수
    errorMessage, // 에러 메시지
    setErrorMessage, // 에러 메시지 설정 함수
    setPublicUser, // 비회원 모드 활성화 함수
  } = useAuthStore();

  // ===== 로컬 상태 관리 =====
  /**
   * 로그인 폼 데이터 상태
   * 사용자가 입력하는 이메일과 비밀번호를 저장
   */
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  });

  /**
   * Zod 유효성 검사 에러 상태
   * 각 필드별 실시간 유효성 검사 결과를 저장
   */
  const [formError, setFormError] = useState<LoginFormError>({});

  // ===== 이벤트 핸들러 함수들 =====

  /**
   * 입력 필드 변경 핸들러
   *
   * 기능:
   * 1. 폼 데이터 업데이트
   * 2. 이전 에러 상태 초기화
   * 3. 실시간 Zod 유효성 검사 수행
   *
   * @param e - 입력 이벤트 객체
   */
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;

      // 폼 데이터 업데이트
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      // 사용자가 입력을 시작하면 이전 에러 메시지 초기화
      if (isError) {
        setIsError(false);
        setErrorMessage(null);
      }

      // ===== 실시간 Zod 유효성 검사 =====
      if (name === 'email') {
        // 이메일 필드 유효성 검사
        const result = LoginSchema.shape.email.safeParse(value);
        setFormError((prev) => ({
          ...prev,
          email: result.success ? undefined : result.error.errors[0].message,
        }));
      } else if (name === 'password') {
        // 비밀번호 필드 유효성 검사
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
   *
   * 로그인 프로세스의 핵심 함수로, 다음 단계를 수행합니다:
   * 1. 기본 폼 제출 이벤트 방지
   * 2. 로딩 상태 활성화
   * 3. Zod를 통한 전체 폼 유효성 검사
   * 4. API 호출을 통한 로그인 시도
   * 5. 성공 시 인증 정보 저장 및 페이지 이동
   * 6. 실패 시 적절한 에러 메시지 표시
   *
   * @param e - 폼 제출 이벤트 객체
   */
  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault(); // 기본 폼 제출 동작 방지

      // 로딩 상태 시작 및 에러 상태 초기화
      setIsLoading(true);
      setIsError(false);
      setErrorMessage(null);

      // ===== Zod 전체 폼 유효성 검사 =====
      const result = LoginSchema.safeParse(formData);
      if (!result.success) {
        // 유효성 검사 실패 시 필드별 에러 메시지 설정
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
        // ===== API 호출을 통한 로그인 시도 =====
        const userData = await authService.login(
          formData.email,
          formData.password,
        );

        // 로그인 성공 시 인증 정보 저장 및 페이지 이동
        setAuth(userData);
        router.push('/posts');
      } catch (error: any) {
        // ===== 에러 처리 =====
        setIsError(true);

        // 에러 코드에 따른 구체적인 에러 메시지 설정
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
        // 로딩 상태 종료
        setIsLoading(false);
      }
    },
    [formData, setIsLoading, setIsError, setErrorMessage, setAuth, router],
  );

  /**
   * 소셜 로그인 핸들러
   *
   * 카카오 또는 구글 소셜 로그인을 처리합니다.
   *
   * @param provider - 소셜 로그인 제공자 ('kakao' | 'google')
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

  // ===== JSX 렌더링 =====
  return (
    <div className="w-full flex flex-col items-center">
      {/* ===== 로고 섹션 ===== */}
      <SvgIcon
        name="logo"
        className="max-md:w-[150px] max-md:h-[44px] w-[240px] h-[70px]"
      />

      {/* ===== 로그인 폼 섹션 ===== */}
      <form
        onSubmit={handleSubmit}
        className="w-full space-y-8 mt-12 max-md:space-y-3"
      >
        {/* 이메일 입력 필드 */}
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="이메일"
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading}
          required
          showClearButton // 입력값 지우기 버튼 표시
          error={formError.email || errorMessage} // 필드별 에러 또는 전체 에러 메시지
        />

        {/* 비밀번호 입력 필드 */}
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="비밀번호"
          value={formData.password}
          onChange={handleChange}
          disabled={isLoading}
          required
          showPasswordToggle // 비밀번호 표시/숨김 토글 버튼
          showClearButton // 입력값 지우기 버튼 표시
          error={formError.password || errorMessage} // 필드별 에러 또는 전체 에러 메시지
        />

        {/* 로그인 제출 버튼 */}
        <Button
          type="submit"
          disabled={isLoading} // 로딩 중일 때 버튼 비활성화
          fullWidth
          className="max-md:text-sm"
        >
          로그인
        </Button>
      </form>

      {/* ===== 계정 관련 링크 섹션 ===== */}
      <div className="flex justify-end space-x-4 w-full mt-3">
        <Link href="/find_password" className="text-xs text-grayscale-100">
          비밀번호 찾기
        </Link>
        <Link href="/signup" className="text-xs text-grayscale-100">
          회원가입
        </Link>
      </div>

      {/* ===== 소셜 로그인 섹션 ===== */}
      <div className="mt-12 w-full">
        {/* 구분선과 제목 */}
        <div className="w-full flex items-center gap-2 mb-6">
          <div className="h-[1px] flex-1 bg-grayscale-80" />
          <p className="text-grayscale-100">소셜 로그인</p>
          <div className="h-[1px] flex-1 bg-grayscale-80" />
        </div>

        {/* 소셜 로그인 버튼들 */}
        <div className="flex justify-center space-x-3 max-md:flex-col max-md:space-x-0 max-md:space-y-3">
          {/* 카카오 로그인 버튼 */}
          <SocialButton
            provider="kakao"
            onClick={() => handleSocialLogin('kakao')}
            fullWidth
            className="max-md:text-sm"
          />
          {/* 구글 로그인 버튼 */}
          <SocialButton
            provider="google"
            onClick={() => handleSocialLogin('google')}
            fullWidth
            className="max-md:text-sm"
          />
        </div>
      </div>

      {/* ===== 비회원 접근 섹션 ===== */}
      <div className="mt-15 w-full">
        <Button
          fullWidth
          variant="secondary" // 보조 스타일 버튼
          className="max-md:text-sm"
          onClick={() => setPublicUser()} // 비회원 모드 활성화
        >
          <Link href="/posts">비회원으로 둘러보기</Link>
        </Button>
      </div>
    </div>
  );
}
