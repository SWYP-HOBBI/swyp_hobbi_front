'use client';

import { useModalStore } from '@/store/modal';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function Modal() {
  const { isOpen, title, message, confirmText, onConfirm, closeModal } =
    useModalStore();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const portalElement =
    typeof document !== 'undefined'
      ? document.getElementById('modal-portal') || document.body
      : null;

  if (!portalElement) return null;

  const handleConfirm = () => {
    onConfirm?.();
    closeModal();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-grayscale-100/50" />
      <div className="space-y-6 p-11  relative bg-grayscale-0 rounded-xl w-full max-w-[360px] flex flex-col items-center text-center shadow-md">
        <div className="font-semibold text-xl text-grayscale-100">
          {title && <h2>{title}</h2>}
          {message && <p>{message}</p>}
        </div>
        <div className="w-full">
          <button
            onClick={handleConfirm}
            className="w-full p-4 bg-primary text-primary-b80 rounded-xl hover:bg-primary/80 button_transition font-semibold "
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    portalElement,
  );
}
