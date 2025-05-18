import { SignupRequest, SignupState } from '@/types/auth';
import { create } from 'zustand';

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

export const useSignupStore = create<SignupState>()((set) => ({
  signupStep: 'signup', // 회원가입 단계
  signupData: initialSignupData, // 회원가입 데이터
  isEmailVerified: false, // 이메일 인증 여부
  isNicknameVerified: false, // 닉네임 인증 여부
  isLoading: false, // 로딩 여부
  isError: false, // 에러 여부
  errorMessage: null, // 에러 메시지
  emailTimer: 0, // 이메일 전송 타이머
  isEmailSent: false, // 이메일 전송 여부

  setSignupStep: (step) => set({ signupStep: step }), // 회원가입 단계 설정

  updateSignupData: (data) =>
    set((state) => ({
      signupData: { ...state.signupData, ...data },
    })), // 회원가입 데이터 업데이트

  setIsEmailVerified: (verified) => set({ isEmailVerified: verified }), // 이메일 인증 여부 설정
  setIsNicknameVerified: (verified) => set({ isNicknameVerified: verified }), // 닉네임 인증 여부 설정
  setEmailTimer: (time) => set({ emailTimer: time }), // 이메일 전송 타이머 설정
  setIsEmailSent: (sent) => set({ isEmailSent: sent }), // 이메일 전송 여부 설정

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

  setIsLoading: (loading) => set({ isLoading: loading }), // 로딩 여부 설정
  setIsError: (error) => set({ isError: error }), // 에러 여부 설정
  setErrorMessage: (message) => set({ errorMessage: message }), // 에러 메시지 설정
}));
