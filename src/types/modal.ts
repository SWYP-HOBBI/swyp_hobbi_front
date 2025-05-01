export interface ModalState {
  isOpen: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  onConfirm?: () => void;
}

export interface ModalStore extends ModalState {
  openModal: (options: Omit<ModalState, 'isOpen'>) => void;
  closeModal: () => void;
}
