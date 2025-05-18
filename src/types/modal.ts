export type ModalType = 'default' | 'error';

export interface ModalState {
  isOpen: boolean; // 모달 열림 여부
  type?: ModalType; // 모달 타입
  title?: string; // 모달 제목
  message?: string; // 모달 메시지
  confirmText?: string; // 확인 버튼 텍스트
  onConfirm?: () => void; // 확인 버튼 클릭 시 실행될 함수
  cancelText?: string; // 취소 버튼 텍스트
  onCancel?: () => void; // 취소 버튼 클릭 시 실행될 함수
  showCancelButton?: boolean; // 취소 버튼 표시 여부
}

export interface ModalStore extends ModalState {
  openModal: (options: Omit<ModalState, 'isOpen'>) => void; // 모달 열기
  closeModal: () => void; // 모달 닫기
}
