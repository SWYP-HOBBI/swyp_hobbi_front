'use client';

import { useEffect } from 'react';
import { useSignupStore } from '@/store/signup';
import { authService } from '@/services/api';

/**
 * 이메일 인증 관련 커스텀 훅
 * 회원가입 시 이메일 인증 관리
 *
 * 주요 기능
 * 1. 이메일 중복 확인
 * 2. 인증 메일 발송
 * 3. 인증 타이머 관리
 * 4. 인증 상태 관리
 * @returns
 */

interface EmailVerificationConfig {
  sendVerificationEmail?: typeof authService.sendVerificationEmail;
  skipDuplicateCheck?: boolean;
}

export function useEmailVerification(config?: EmailVerificationConfig) {
  const {
    signupData, // 회원가입 데이터
    updateSignupData, // 회원가입 데이터 업데이트
    isEmailVerified, // 이메일 인증 상태
    setIsEmailVerified, // 이메일 인증 상태 설정
    setIsLoading, // 로딩 상태 설정
    setIsError, // 에러 상태 설정
    setErrorMessage, // 에러 메시지 설정
    isEmailSent, // 이메일 인증 메일 발송 상태
    setIsEmailSent, // 이메일 인증 메일 발송 상태 설정
    emailTimer, // 이메일 인증 타이머
    setEmailTimer, // 이메일 인증 타이머 설정
  } = useSignupStore();

  /**
   * 이메일 인증 타이머 관리
   * 인증 메일 발송 후 3분간 타이머를 실행
   */
  useEffect(() => {
    let timer: NodeJS.Timeout;

    // 이메일이 발송되고 타이머가 0보다 큰 경우에만 타이머 실행
    if (isEmailSent && emailTimer > 0) {
      timer = setInterval(() => {
        setEmailTimer(emailTimer - 1);

        // 타이머 종료 시 이메일 발송 상태 초기화
        if (emailTimer <= 1) {
          setIsEmailSent(false);
        }
      }, 1000); // 1초마다 실행
    }

    // 컴포넌트 언마운트 또는 의존성 변경 시 타이머 초기화
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isEmailSent, emailTimer, setEmailTimer, setIsEmailSent]);

  /**
   * 이메일 중복 확인 및 인증 메일 발송 함수
   * 1. 이메일 입력 확인
   * 2. 이메일 중복 체크
   * 3. 인증 메일 발송
   * 4. 타이머 시작
   */
  const checkEmailAndSendVerification = async () => {
    // 이메일 입력 확인
    if (!signupData.email) {
      setIsError(true);
      setErrorMessage('이메일을 입력해주세요.');
      return;
    }

    try {
      // 상태 초기화
      setIsLoading(true);
      setIsError(false);
      setErrorMessage(null);

      // 이메일 중복 확인 (비밀번호 찾기에서는 스킵)
      if (!config?.skipDuplicateCheck) {
        const duplicateResponse = await authService.checkEmailDuplicate(
          signupData.email,
        );

        // 중복된 이메일인 경우
        if (
          typeof duplicateResponse === 'object' &&
          duplicateResponse !== null &&
          'isDuplicate' in duplicateResponse &&
          duplicateResponse.isDuplicate
        ) {
          setIsError(true);
          setErrorMessage('이미 등록된 회원입니다.');
          return;
        }
      }

      // 인증 메일 발송
      const sendEmail =
        config?.sendVerificationEmail || authService.sendVerificationEmail;
      await sendEmail(signupData.email);

      // 타이머 시작 (3분)
      setEmailTimer(180);
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

  // 타이머 시간 mm:ss 형식으로 변환하는 함수
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * 이메일 인증 상태 관리
   * 로컬 스토리지를 통해 인증 상태를 유지하고,
   * 여러 창 간의 인증 상태를 동기화
   */
  useEffect(() => {
    // 로컬 스토리지에서 인증 상태 확인
    const checkVerificationStatus = () => {
      const storedVerified = localStorage.getItem('emailVerified') === 'true';
      const storedEmail = localStorage.getItem('verifiedEmail');

      // 저장된 인증 정보가 현재 이메일과 일치하는 경우 인증 상태 복원
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

    // 초기 상태 확인
    checkVerificationStatus();

    // 다른 창에서의 인증 상태 변경 감지
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'emailVerified' || e.key === 'verifiedEmail') {
        checkVerificationStatus();
      }
    };

    // 스토리지 이벤트 등록
    window.addEventListener('storage', handleStorageChange);

    // 클린업 함수
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return {
    isEmailVerified, // 이메일 인증 상태
    isEmailSent, // 이메일 인증 메일 발송 상태
    emailTimer, // 이메일 인증 타이머
    formatTime, // 타이머 시간 포맷
    checkEmailAndSendVerification, // 이메일 중복 확인 및 인증 메일 발송
  };
}
