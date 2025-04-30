export const MBTI_OPTIONS = [
  'ISTJ',
  'ISFJ',
  'INFJ',
  'INTJ',
  'ISTP',
  'ISFP',
  'INFP',
  'INTP',
  'ESTP',
  'ESFP',
  'ENFP',
  'ENTP',
  'ESTJ',
  'ESFJ',
  'ENFJ',
  'ENTJ',
] as const;

export type SignupStep = 'signup' | 'userInfo';

export type MBTIType = (typeof MBTI_OPTIONS)[number] | '';

export type Gender = '남성' | '여성';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  userId: number;
  hobbyTags: string[];
}

export interface SignupFormData {
  username: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

export interface UserInfoFormData {
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  gender: Gender;
  nickname: string;
  mbti: MBTIType;
  hobbyTags: string[];
}

export interface SignupRequest {
  email: string;
  username: string;
  password: string;
  passwordConfirm: string;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  gender: '남성' | '여성';
  nickname: string;
  mbti: MBTIType;
  userImageUrl: string;
  hobbyTags: string[];
}

// store/auth.ts에서 사용하는 타입
export interface AuthState {
  isAuthenticated: boolean; // 로그인 상태 여부
  accessToken: string | null; // 액세스 토큰
  refreshToken: string | null; // 리프레쉬 토큰
  userId: number | null; // 유저 아이디
  isLoading: boolean; // 로딩 여부
  isError: boolean; // 에러 여부
  errorMessage: string | null; // 에러 메시지
  hobbyTags: string[]; // 취미 태그

  setAuth: (params: {
    accessToken: string;
    refreshToken: string;
    userId: number;
    hobbyTags: string[];
  }) => void;

  logout: () => void;
  setIsLoading: (loading: boolean) => void; // 로딩 여부 설정
  setIsError: (error: boolean) => void; // 에러 여부 설정
  setErrorMessage: (message: string | null) => void; // 에러 메시지 설정
}

// store/signup.ts에서 사용하는 타입
export interface SignupState {
  signupStep: SignupStep; // 회원가입 단계
  signupData: SignupRequest; // 회원가입 데이터
  isEmailVerified: boolean; // 이메일 인증 여부
  isNicknameVerified: boolean; // 닉네임 중복 확인 여부
  isLoading: boolean; // 로딩 여부
  isError: boolean; // 에러 여부
  errorMessage: string | null; // 에러 메시지
  emailTimer: number; // 이메일 인증 타이머
  isEmailSent: boolean; // 이메일 인증 메일 발송 여부

  // 회원가입 관련 액션
  setSignupStep: (step: SignupStep) => void; // 회원가입 단계 설정
  updateSignupData: (data: Partial<SignupRequest>) => void; // 회원가입 데이터 업데이트
  setIsEmailVerified: (verified: boolean) => void; // 이메일 인증 여부 설정
  setIsNicknameVerified: (verified: boolean) => void; // 닉네임 중복 확인 여부 설정
  resetSignup: () => void; // 회원가입 데이터 초기화
  setIsLoading: (loading: boolean) => void; // 로딩 여부 설정
  setIsError: (error: boolean) => void; // 에러 여부 설정
  setErrorMessage: (message: string | null) => void; // 에러 메시지 설정
  setEmailTimer: (timer: number) => void; // 이메일 인증 타이머 설정
  setIsEmailSent: (sent: boolean) => void; // 이메일 인증 메일 발송 여부 설정
}
