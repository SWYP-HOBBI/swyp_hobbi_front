import { ModalState, ModalStore } from '@/types/modal';
import { create } from 'zustand';

const initialState: ModalState = {
  isOpen: false, // 모달 열림 여부
  type: 'default', // 모달 타입
  title: '', // 모달 제목
  message: '', // 모달 메시지
  confirmText: '확인', // 확인 버튼 텍스트
  cancelText: '취소', // 취소 버튼 텍스트
  showCancelButton: false, // 취소 버튼 표시 여부
};

export const useModalStore = create<ModalStore>((set) => ({
  ...initialState,
  openModal: (options) =>
    set({
      isOpen: true,
      ...options,
    }), // 모달 열기
  closeModal: () => set(initialState), // 모달 닫기
}));
