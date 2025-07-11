import { SignupRequest, SignupState } from '@/types/auth';
import { create } from 'zustand';

/**
 * 회원가입 초기 데이터
 *
 * 회원가입 폼의 기본값들을 정의합니다.
 *
 * 데이터 구조:
 * - email: 사용자 이메일 주소
 * - username: 로그인용 아이디
 * - password: 비밀번호
 * - passwordConfirm: 비밀번호 확인 (일치 검증용)
 * - birthYear: 생년 (숫자)
 * - birthMonth: 생월 (숫자)
 * - birthDay: 생일 (숫자)
 * - gender: 성별 (기본값: '남성')
 * - nickname: 사용자 닉네임
 * - mbti: MBTI 성격 유형
 * - hobbyTags: 선택된 취미 태그 배열
 * - userImageUrl: 프로필 이미지 URL
 *
 * 사용 목적:
 * - 회원가입 폼 초기화
 * - 데이터 리셋 시 기본값 제공
 * - 타입 안전성 보장
 * - 일관된 데이터 구조 유지
 */
const initialSignupData: SignupRequest = {
  email: '', // 이메일
  username: '', // 아이디
  password: '', // 비밀번호
  passwordConfirm: '', // 비밀번호 확인
  birthYear: 0, // 생년
  birthMonth: 0, // 생월
  birthDay: 0, // 생일
  gender: '남성', // 성별
  nickname: '', // 닉네임
  mbti: '', // MBTI
  hobbyTags: [], // 취미 태그
  userImageUrl: '', // 유저 이미지 주소
};

/**
 * 회원가입 상태 관리 스토어
 *
 * Zustand를 사용하여 회원가입 과정의 모든 상태를 전역적으로 관리합니다.
 *
 * 주요 기능:
 * 1. 회원가입 단계별 진행 상태 관리
 * 2. 회원가입 폼 데이터 관리
 * 3. 이메일 인증 및 닉네임 중복 확인 상태 관리
 * 4. 로딩 및 에러 상태 관리
 * 5. 이메일 전송 타이머 관리
 *
 * 상태 구조:
 * - signupStep: 현재 회원가입 단계
 * - signupData: 회원가입 폼 데이터
 * - isEmailVerified: 이메일 인증 완료 여부
 * - isNicknameVerified: 닉네임 중복 확인 완료 여부
 * - isLoading: API 호출 중 로딩 상태
 * - isError: 에러 발생 여부
 * - errorMessage: 에러 메시지
 * - emailTimer: 이메일 재전송 대기 시간
 * - isEmailSent: 이메일 전송 완료 여부
 *
 * 사용자 경험:
 * - 단계별 회원가입 진행
 * - 실시간 폼 데이터 유효성 검증
 * - 이메일 인증 및 닉네임 중복 확인
 * - 로딩 상태 표시로 사용자 피드백 제공
 * - 에러 메시지로 명확한 안내
 *
 * 기술적 특징:
 * - Zustand를 통한 상태 관리
 * - TypeScript를 통한 타입 안전성
 * - 단계별 진행 상태 추적
 * - 실시간 데이터 동기화
 * - 에러 처리 및 복구 기능
 *
 * 보안 고려사항:
 * - 비밀번호 확인 기능
 * - 이메일 인증을 통한 계정 보안
 * - 중복 닉네임 방지
 * - 데이터 유효성 검증
 */
export const useSignupStore = create<SignupState>()((set) => ({
  // ===== 초기 상태 =====

  /**
   * 회원가입 단계
   *
   * 현재 진행 중인 회원가입 단계를 나타냅니다.
   * 기본값은 'signup'으로 시작합니다.
   *
   * 가능한 단계들:
   * - 'signup': 기본 회원가입 정보 입력
   * - 'verification': 이메일 인증
   * - 'profile': 프로필 정보 입력
   * - 'complete': 회원가입 완료
   */
  signupStep: 'signup',

  /**
   * 회원가입 데이터
   *
   * 사용자가 입력한 모든 회원가입 정보를 저장합니다.
   * initialSignupData를 기본값으로 사용합니다.
   */
  signupData: initialSignupData,

  /**
   * 이메일 인증 완료 여부
   *
   * 사용자가 이메일 인증을 완료했는지 여부를 나타냅니다.
   * false: 인증 미완료, true: 인증 완료
   */
  isEmailVerified: false,

  /**
   * 닉네임 중복 확인 완료 여부
   *
   * 사용자가 입력한 닉네임의 중복 확인을 완료했는지 여부를 나타냅니다.
   * false: 확인 미완료, true: 확인 완료 (중복 아님)
   */
  isNicknameVerified: false,

  /**
   * 로딩 상태
   *
   * API 호출이나 데이터 처리 중인지 여부를 나타냅니다.
   * false: 처리 완료, true: 처리 중
   */
  isLoading: false,

  /**
   * 에러 발생 여부
   *
   * 회원가입 과정에서 에러가 발생했는지 여부를 나타냅니다.
   * false: 정상, true: 에러 발생
   */
  isError: false,

  /**
   * 에러 메시지
   *
   * 발생한 에러의 구체적인 메시지를 저장합니다.
   * null: 에러 없음, string: 에러 메시지
   */
  errorMessage: null,

  /**
   * 이메일 전송 타이머
   *
   * 이메일 재전송 대기 시간을 초 단위로 저장합니다.
   * 0: 재전송 가능, 양수: 대기 시간
   */
  emailTimer: 0,

  /**
   * 이메일 전송 완료 여부
   *
   * 인증 이메일이 성공적으로 전송되었는지 여부를 나타냅니다.
   * false: 전송 안됨, true: 전송 완료
   */
  isEmailSent: false,

  // ===== 액션 함수들 =====

  /**
   * 회원가입 단계 설정 함수
   *
   * 현재 회원가입 단계를 변경합니다.
   *
   * 처리 과정:
   * 1. 새로운 단계 값을 받아서 상태 업데이트
   * 2. UI에서 해당 단계에 맞는 화면 표시
   *
   * 사용 시나리오:
   * - 단계별 진행 버튼 클릭
   * - 이전 단계로 돌아가기
   * - 회원가입 완료 시 단계 변경
   *
   * @param step - 변경할 회원가입 단계
   */
  setSignupStep: (step) => set({ signupStep: step }),

  /**
   * 회원가입 데이터 업데이트 함수
   *
   * 회원가입 폼의 특정 필드 값을 업데이트합니다.
   *
   * 처리 과정:
   * 1. 기존 signupData와 새로운 data를 병합
   * 2. 부분 업데이트로 다른 필드 값 유지
   * 3. 실시간으로 폼 상태 동기화
   *
   * 사용 시나리오:
   * - 사용자가 폼 필드에 입력
   * - 자동 저장 기능
   * - 데이터 검증 후 수정
   *
   * 예시:
   * ```typescript
   * updateSignupData({ email: 'user@example.com' });
   * updateSignupData({ nickname: '사용자', mbti: 'INTJ' });
   * ```
   *
   * @param data - 업데이트할 데이터 객체
   */
  updateSignupData: (data) =>
    set((state) => ({
      signupData: { ...state.signupData, ...data },
    })),

  /**
   * 이메일 인증 상태 설정 함수
   *
   * 이메일 인증 완료 여부를 설정합니다.
   *
   * 처리 과정:
   * 1. 인증 완료 여부를 받아서 상태 업데이트
   * 2. UI에서 인증 상태에 따른 표시 변경
   *
   * 사용 시나리오:
   * - 이메일 인증 링크 클릭 후
   * - 인증 코드 입력 완료 후
   * - 인증 만료 시 재설정
   *
   * @param verified - 이메일 인증 완료 여부
   */
  setIsEmailVerified: (verified) => set({ isEmailVerified: verified }),

  /**
   * 닉네임 인증 상태 설정 함수
   *
   * 닉네임 중복 확인 완료 여부를 설정합니다.
   *
   * 처리 과정:
   * 1. 중복 확인 완료 여부를 받아서 상태 업데이트
   * 2. UI에서 중복 확인 상태에 따른 표시 변경
   *
   * 사용 시나리오:
   * - 닉네임 중복 확인 API 호출 후
   * - 닉네임 변경 시 재확인
   * - 중복 확인 만료 시 재설정
   *
   * @param verified - 닉네임 중복 확인 완료 여부
   */
  setIsNicknameVerified: (verified) => set({ isNicknameVerified: verified }),

  /**
   * 이메일 전송 타이머 설정 함수
   *
   * 이메일 재전송 대기 시간을 설정합니다.
   *
   * 처리 과정:
   * 1. 대기 시간을 초 단위로 받아서 상태 업데이트
   * 2. UI에서 타이머 표시 및 재전송 버튼 제어
   *
   * 사용 시나리오:
   * - 이메일 전송 후 타이머 시작
   * - 타이머 만료 시 재전송 가능
   * - 실시간 타이머 업데이트
   *
   * @param time - 대기 시간 (초)
   */
  setEmailTimer: (time) => set({ emailTimer: time }),

  /**
   * 이메일 전송 상태 설정 함수
   *
   * 인증 이메일 전송 완료 여부를 설정합니다.
   *
   * 처리 과정:
   * 1. 전송 완료 여부를 받아서 상태 업데이트
   * 2. UI에서 전송 상태에 따른 표시 변경
   *
   * 사용 시나리오:
   * - 이메일 전송 API 호출 성공 후
   * - 전송 실패 시 재설정
   * - 전송 상태 초기화
   *
   * @param sent - 이메일 전송 완료 여부
   */
  setIsEmailSent: (sent) => set({ isEmailSent: sent }),

  /**
   * 회원가입 상태 초기화 함수
   *
   * 모든 회원가입 관련 상태를 초기값으로 리셋합니다.
   *
   * 초기화 대상:
   * - signupStep: 'signup'
   * - signupData: initialSignupData
   * - isEmailVerified: false
   * - isNicknameVerified: false
   * - isLoading: false
   * - isError: false
   * - errorMessage: null
   * - emailTimer: 0
   * - isEmailSent: false
   *
   * 사용 시나리오:
   * - 회원가입 완료 후
   * - 회원가입 취소 시
   * - 에러 복구 시
   * - 새로운 회원가입 시작 시
   *
   * 장점:
   * - 메모리 누수 방지
   * - 깨끗한 상태 보장
   * - 다음 회원가입 시 안전한 시작
   */
  resetSignup: () =>
    set({
      signupStep: 'signup',
      signupData: initialSignupData,
      isEmailVerified: false,
      isNicknameVerified: false,
      isLoading: false,
      isError: false,
      errorMessage: null,
      emailTimer: 0,
      isEmailSent: false,
    }),

  /**
   * 로딩 상태 설정 함수
   *
   * API 호출이나 데이터 처리 중인지 여부를 설정합니다.
   *
   * 처리 과정:
   * 1. 로딩 여부를 받아서 상태 업데이트
   * 2. UI에서 로딩 스피너 또는 버튼 비활성화
   *
   * 사용 시나리오:
   * - API 호출 시작 시 true
   * - API 호출 완료 시 false
   * - 사용자 액션 중복 방지
   *
   * @param loading - 로딩 여부
   */
  setIsLoading: (loading) => set({ isLoading: loading }),

  /**
   * 에러 상태 설정 함수
   *
   * 에러 발생 여부를 설정합니다.
   *
   * 처리 과정:
   * 1. 에러 여부를 받아서 상태 업데이트
   * 2. UI에서 에러 상태에 따른 표시 변경
   *
   * 사용 시나리오:
   * - API 호출 실패 시 true
   * - 에러 복구 시 false
   * - 에러 메시지 표시 제어
   *
   * @param error - 에러 발생 여부
   */
  setIsError: (error) => set({ isError: error }),

  /**
   * 에러 메시지 설정 함수
   *
   * 발생한 에러의 구체적인 메시지를 설정합니다.
   *
   * 처리 과정:
   * 1. 에러 메시지를 받아서 상태 업데이트
   * 2. UI에서 에러 메시지 표시
   *
   * 사용 시나리오:
   * - API 에러 응답 처리
   * - 유효성 검증 실패
   * - 사용자에게 명확한 에러 안내
   *
   * @param message - 에러 메시지 (null 또는 string)
   */
  setErrorMessage: (message) => set({ errorMessage: message }),
}));
