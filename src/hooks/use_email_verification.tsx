'use client';

import { useEffect } from 'react';
import { useSignupStore } from '@/store/signup';
import { authApi } from '@/api/auth';

/**
 * 이메일 인증 관련 커스텀 훅
 *
 * 회원가입 및 비밀번호 찾기 시 이메일 인증을 관리하는 훅입니다.
 *
 * 주요 기능:
 * 1. 이메일 중복 확인 (회원가입 시)
 * 2. 인증 메일 발송 (6자리 코드 포함)
 * 3. 인증 타이머 관리 (3분 카운트다운)
 * 4. 인증 상태 관리
 *
 * 사용 시나리오:
 * - 회원가입: 이메일 중복 확인 후 인증 메일 발송
 * - 비밀번호 찾기: 중복 확인 없이 인증 메일 발송
 *
 * 기술적 특징:
 * - Zustand 스토어를 통한 상태 관리
 * - 타이머를 통한 인증 시간 제한 (3분)
 * - 에러 처리 및 로딩 상태 관리
 * - 6자리 인증 코드 방식 지원
 *
 * 반환값:
 * - isEmailVerified: 이메일 인증 완료 여부
 * - isEmailSent: 인증 메일 발송 여부
 * - emailTimer: 남은 인증 시간 (초)
 * - formatTime: 타이머 시간 포맷팅 함수
 * - checkEmailAndSendVerification: 인증 메일 발송 함수
 *
 * 인증 프로세스:
 * 1. 이메일 입력 확인
 * 2. 이메일 중복 확인 (회원가입 시)
 * 3. 인증 메일 발송 (6자리 코드 포함)
 * 4. 3분 타이머 시작
 * 5. 사용자가 메일에서 6자리 코드 확인
 * 6. 코드 입력 후 인증 완료
 */

/**
 * 이메일 인증 설정 인터페이스
 *
 * 훅의 동작을 커스터마이징할 수 있는 설정 옵션들입니다.
 *
 * @param sendVerificationEmail - 인증 메일 발송 함수 (기본값: authApi.sendVerificationEmail)
 * @param skipDuplicateCheck - 이메일 중복 확인 스킵 여부 (비밀번호 찾기 시 사용)
 */
interface EmailVerificationConfig {
  sendVerificationEmail?: typeof authApi.sendVerificationEmail;
  skipDuplicateCheck?: boolean;
}

/**
 * 이메일 인증 커스텀 훅
 *
 * 이메일 인증과 관련된 모든 로직을 관리하는 훅입니다.
 *
 * @param config - 이메일 인증 설정 옵션 (선택적)
 * @returns 이메일 인증 관련 상태와 함수들
 */
export function useEmailVerification(config?: EmailVerificationConfig) {
  // ===== 스토어에서 상태 및 함수 가져오기 =====

  /**
   * 회원가입 스토어에서 필요한 상태와 함수들을 가져옵니다.
   *
   * 상태:
   * - signupData: 회원가입 입력 데이터
   * - isEmailVerified: 이메일 인증 완료 여부
   * - isEmailSent: 인증 메일 발송 여부
   * - emailTimer: 인증 타이머 (초 단위)
   *
   * 함수:
   * - setIsLoading: 로딩 상태 설정
   * - setIsError: 에러 상태 설정
   * - setErrorMessage: 에러 메시지 설정
   * - setIsEmailSent: 이메일 발송 상태 설정
   * - setEmailTimer: 타이머 설정
   */
  const {
    signupData, // 회원가입 데이터
    setIsLoading, // 로딩 상태 설정
    setIsError, // 에러 상태 설정
    setErrorMessage, // 에러 메시지 설정
    isEmailVerified, // 이메일 인증 완료 여부
    isEmailSent, // 이메일 인증 메일 발송 상태
    setIsEmailSent, // 이메일 인증 메일 발송 상태 설정
    emailTimer, // 이메일 인증 타이머
    setEmailTimer, // 이메일 인증 타이머 설정
  } = useSignupStore();

  // ===== 이메일 인증 타이머 관리 =====

  /**
   * 이메일 인증 타이머 관리 useEffect
   *
   * 인증 메일 발송 후 3분간 카운트다운 타이머를 실행합니다.
   *
   * 동작 방식:
   * 1. 이메일이 발송되고 타이머가 0보다 큰 경우에만 타이머 실행
   * 2. 1초마다 타이머 값을 1씩 감소
   * 3. 타이머가 1 이하가 되면 이메일 발송 상태 초기화
   * 4. 컴포넌트 언마운트 시 타이머 정리
   *
   * 타이머 특징:
   * - 3분(180초) 카운트다운
   * - 1초마다 업데이트
   * - 타이머 종료 시 자동으로 발송 상태 초기화
   *
   * 메모리 관리:
   * - 컴포넌트 언마운트 시 타이머 정리
   * - 의존성 변경 시 이전 타이머 정리 후 새 타이머 시작
   */
  useEffect(() => {
    let timer: NodeJS.Timeout;

    // ===== 타이머 실행 조건 확인 =====
    // 이메일이 발송되고 타이머가 0보다 큰 경우에만 타이머 실행
    if (isEmailSent && emailTimer > 0) {
      timer = setInterval(() => {
        // ===== 타이머 감소 =====
        setEmailTimer(emailTimer - 1);

        // ===== 타이머 종료 처리 =====
        // 타이머가 1 이하가 되면 이메일 발송 상태 초기화
        if (emailTimer <= 1) {
          setIsEmailSent(false);
        }
      }, 1000); // 1초마다 실행
    }

    // ===== 클린업 함수 =====
    // 컴포넌트 언마운트 또는 의존성 변경 시 타이머 초기화
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isEmailSent, emailTimer, setEmailTimer, setIsEmailSent]);

  // ===== 이메일 중복 확인 및 인증 메일 발송 함수 =====

  /**
   * 이메일 중복 확인 및 인증 메일 발송 함수
   *
   * 이메일 인증 프로세스의 핵심 함수입니다.
   *
   * 처리 과정:
   * 1. 이메일 입력 확인
   * 2. 로딩 상태 설정 및 에러 초기화
   * 3. 이메일 중복 확인 (설정에 따라 스킵 가능)
   * 4. 인증 메일 발송 (6자리 코드 포함)
   * 5. 타이머 시작 (3분)
   * 6. 에러 처리 및 상태 정리
   *
   * 에러 처리:
   * - 이메일 미입력: "이메일을 입력해주세요."
   * - 중복 이메일: "이미 등록된 회원입니다."
   * - API 오류: 서버 에러 메시지 또는 기본 메시지
   *
   * 설정 옵션:
   * - skipDuplicateCheck: 중복 확인 스킵 (비밀번호 찾기 시)
   * - sendVerificationEmail: 커스텀 인증 메일 발송 함수
   */
  const checkEmailAndSendVerification = async () => {
    // ===== 이메일 입력 확인 =====
    if (!signupData.email) {
      setIsError(true);
      setErrorMessage('이메일을 입력해주세요.');
      return;
    }

    try {
      // ===== 상태 초기화 =====
      setIsLoading(true);
      setIsError(false);
      setErrorMessage(null);

      // ===== 이메일 중복 확인 =====
      // 비밀번호 찾기에서는 중복 확인을 스킵
      if (!config?.skipDuplicateCheck) {
        const duplicateResponse = await authApi.checkEmailDuplicate(
          signupData.email,
        );

        // ===== 중복 이메일 처리 =====
        // 중복된 이메일인 경우 에러 처리
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

      // ===== 인증 메일 발송 =====
      // 설정에서 커스텀 함수를 사용하거나 기본 함수 사용
      const sendEmail =
        config?.sendVerificationEmail || authApi.sendVerificationEmail;
      await sendEmail(signupData.email);

      // ===== 타이머 시작 =====
      // 3분(180초) 타이머 시작
      setEmailTimer(180);
      setIsEmailSent(true);
    } catch (error) {
      // ===== 에러 처리 =====
      setIsError(true);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : '이메일 인증 과정에서 오류가 발생했습니다.',
      );
    } finally {
      // ===== 로딩 상태 해제 =====
      setIsLoading(false);
    }
  };

  // ===== 타이머 시간 포맷팅 함수 =====

  /**
   * 타이머 시간을 mm:ss 형식으로 변환하는 함수
   *
   * 초 단위 시간을 분:초 형식으로 변환합니다.
   *
   * 변환 예시:
   * - 180초 → "3:00"
   * - 125초 → "2:05"
   * - 45초 → "0:45"
   *
   * @param seconds - 변환할 초 단위 시간
   * @returns mm:ss 형식의 문자열
   */
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ===== 훅 반환값 =====

  /**
   * 이메일 인증 관련 상태와 함수들을 반환합니다.
   *
   * 반환값:
   * - isEmailVerified: 이메일 인증 완료 여부 (boolean)
   * - isEmailSent: 인증 메일 발송 여부 (boolean)
   * - emailTimer: 남은 인증 시간 (number, 초 단위)
   * - formatTime: 타이머 시간 포맷팅 함수 (seconds: number) => string
   * - checkEmailAndSendVerification: 인증 메일 발송 함수 (async function)
   */
  return {
    isEmailVerified, // 이메일 인증 완료 여부
    isEmailSent, // 이메일 인증 메일 발송 상태
    emailTimer, // 이메일 인증 타이머
    formatTime, // 타이머 시간 포맷
    checkEmailAndSendVerification, // 이메일 중복 확인 및 인증 메일 발송
  };
}
