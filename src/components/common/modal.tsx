'use client';

import { useModalStore } from '@/store/modal';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import Button from './button';

export default function Modal() {
  const {
    isOpen,
    type = 'default',
    title,
    message,
    confirmText,
    onConfirm,
    cancelText,
    onCancel,
    showCancelButton,
    hideButtons,
    closeModal,
  } = useModalStore();

  const pathname = usePathname();
  const shouldAddPadding =
    pathname === '/posts' || // 메인 피드
    pathname === '/my-page'; // 마이페이지

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

  const handleCancel = () => {
    onCancel?.();
    closeModal();
  };

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${shouldAddPadding ? 'md:pl-[280px]' : ''}`}
    >
      <div className="absolute inset-0 bg-grayscale-100/50" />
      <div className="space-y-6 p-11 relative bg-grayscale-0 rounded-xl w-full max-w-[360px] flex flex-col items-center text-center shadow-md mx-4 md:mx-0">
        <div
          className={`font-semibold text-xl ${type === 'error' ? 'text-like' : 'text-grayscale-100'}`}
        >
          {title && <h2>{title}</h2>}
          {message && (
            <p className="whitespace-pre-line text-base mt-2">{message}</p>
          )}
        </div>
        {!hideButtons && (
          <div className={`w-full ${showCancelButton ? 'flex gap-3' : ''}`}>
            {showCancelButton && (
              <button
                onClick={handleCancel}
                className={`p-4 border border-primary-b60 bg-grayscale-0 text-primary-b60 hover:bg-primary-b60 hover:text-grayscale-0 rounded-xl button_transition font-semibold ${showCancelButton ? 'flex-1' : 'w-full'}`}
              >
                {cancelText}
              </button>
            )}
            <button
              onClick={handleConfirm}
              className={`p-4 bg-primary text-primary-b80 rounded-xl hover:bg-primary/80 button_transition font-semibold ${showCancelButton ? 'flex-1' : 'w-full'}`}
            >
              {confirmText}
            </button>
          </div>
        )}
      </div>
    </div>,
    portalElement,
  );
}
