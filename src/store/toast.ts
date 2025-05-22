import { create } from 'zustand';

interface ToastState {
  isVisible: boolean;
  message: string;
  showToast: (message: string) => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  isVisible: false,
  message: '',
  showToast: (message: string) => set({ isVisible: true, message }),
  hideToast: () => set({ isVisible: false, message: '' }),
}));
