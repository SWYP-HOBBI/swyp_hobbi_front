import { useEffect } from 'react';
import { useSignupStore } from '@/store/signup';
import { authService } from '@/services/api';

export function useEmailVerification() {
  const {
    signupData,
    updateSignupData,
    isEmailVerified,
    setIsEmailVerified,
    setIsLoading,
    setIsError,
    setErrorMessage,
    isEmailSent,
    setIsEmailSent,
    emailTimer,
    setEmailTimer,
  } = useSignupStore();

  // 타이머 관리
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isEmailSent && emailTimer > 0) {
      timer = setInterval(() => {
        setEmailTimer(emailTimer - 1);

        if (emailTimer <= 1) {
          setIsEmailSent(false);
        }
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isEmailSent, emailTimer, setEmailTimer, setIsEmailSent]);

  // 이메일 중복 확인 및 인증 메일 발송
  const checkEmailAndSendVerification = async () => {
    if (!signupData.email) {
      setIsError(true);
      setErrorMessage('이메일을 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      setIsError(false);
      setErrorMessage(null);

      // 이메일 중복 확인 API 호출
      const duplicateResponse = await authService.checkEmailDuplicate(
        signupData.email,
      );

      if (
        typeof duplicateResponse === 'object' &&
        duplicateResponse !== null &&
        'duplicate' in duplicateResponse &&
        duplicateResponse.duplicate
      ) {
        setIsError(true);
        setErrorMessage('이미 등록된 회원입니다.');
        return;
      }

      // 인증 메일 발송 API 호출
      await authService.sendVerificationEmail(signupData.email);

      // 타이머 시작
      setEmailTimer(180); // 3분
      setIsEmailSent(true);
    } catch (error) {
      setIsError(true);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : '이메일 인증 과정에서 오류가 발생했습니다.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 타이머 포맷 (mm:ss)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 로컬 스토리지에서 이메일 인증 상태 로드
  useEffect(() => {
    const checkVerificationStatus = () => {
      const storedVerified = localStorage.getItem('emailVerified') === 'true';
      const storedEmail = localStorage.getItem('verifiedEmail');

      if (
        storedVerified &&
        storedEmail &&
        (!signupData.email || signupData.email === storedEmail)
      ) {
        updateSignupData({ email: storedEmail });
        setIsEmailVerified(true);
        setIsEmailSent(false);
      }
    };

    checkVerificationStatus();

    // 창 간 통신 이벤트 리스너
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'emailVerified' || e.key === 'verifiedEmail') {
        checkVerificationStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return {
    isEmailVerified,
    isEmailSent,
    emailTimer,
    formatTime,
    checkEmailAndSendVerification,
  };
}
