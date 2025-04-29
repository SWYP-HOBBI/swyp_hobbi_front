import { ModalState, ModalStore } from '@/types/modal';
import { create } from 'zustand';

const initialState: ModalState = {
  isOpen: false,
  title: '',
  message: '',
  confirmText: '확인',
};

export const useModalStore = create<ModalStore>((set) => ({
  ...initialState,
  openModal: (options) =>
    set({
      isOpen: true,
      ...options,
    }),
  closeModal: () => set(initialState),
}));
