import { SignupRequest, SignupState } from '@/types/auth';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const initialSignupData: SignupRequest = {
  email: '',
  username: '',
  password: '',
  passwordConfirm: '',
  birthYear: 0,
  birthMonth: 0,
  birthDay: 0,
  gender: '남성',
  nickname: '',
  mbti: '',
  hobbyTags: [],
  userImageUrl: '',
};

export const useSignupStore = create<SignupState>()(
  persist(
    (set) => ({
      signupStep: 'signup',
      signupData: initialSignupData,
      isEmailVerified: false,
      isNicknameVerified: false,
      isLoading: false,
      isError: false,
      errorMessage: null,
      emailTimer: 0,
      isEmailSent: false,

      setSignupStep: (step) => set({ signupStep: step }),

      updateSignupData: (data) =>
        set((state) => ({
          signupData: { ...state.signupData, ...data },
        })),

      setIsEmailVerified: (verified) => set({ isEmailVerified: verified }),
      setIsNicknameVerified: (verified) =>
        set({ isNicknameVerified: verified }),
      setEmailTimer: (time) => set({ emailTimer: time }),
      setIsEmailSent: (sent) => set({ isEmailSent: sent }),

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

      setIsLoading: (loading) => set({ isLoading: loading }),
      setIsError: (error) => set({ isError: error }),
      setErrorMessage: (message) => set({ errorMessage: message }),
    }),
    {
      name: 'signup-storage',
      partialize: (state) => ({
        signupStep: state.signupStep,
        signupData: {
          ...state.signupData,
          password: undefined,
          passwordConfirm: undefined,
        },
        isEmailVerified: state.isEmailVerified,
        isNicknameVerified: state.isNicknameVerified,
      }),
    },
  ),
);
