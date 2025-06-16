'use client';

import { useModalStore } from '@/store/modal';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

/**
 * 전역 모달 컴포넌트
 * - store에서 상태 관리
 * - type, title, message, 버튼 텍스트 등 다양한 props 지원
 * - 페이지별 padding, 스크롤 방지, 포탈 렌더링 등 지원
 */
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
    pathname === '/my_page' || // 마이페이지
    pathname === '/posts/write'; // 게시글 작성

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

  /** 확인 버튼 클릭 핸들러 */
  const handleConfirm = () => {
    onConfirm?.();
    closeModal();
  };

  /** 취소 버튼 클릭 핸들러 */
  const handleCancel = () => {
    onCancel?.();
    closeModal();
  };

  return createPortal(
    <div
      className={clsx(
        'fixed inset-0 z-50 flex items-center justify-center',
        shouldAddPadding && 'md:pl-[280px]',
      )}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-grayscale-100/50"
        aria-hidden="true"
      />
      <div className="space-y-6 p-11 relative bg-grayscale-0 rounded-xl w-full max-w-[360px] flex flex-col items-center text-center shadow-md mx-4 md:mx-0">
        <div
          className={clsx(
            'font-semibold text-xl',
            type === 'error' ? 'text-like' : 'text-grayscale-100',
          )}
        >
          {title && <h2>{title}</h2>}
          {message && (
            <p className="whitespace-pre-line text-base mt-2">{message}</p>
          )}
        </div>
        {!hideButtons && (
          <div className={clsx('w-full', showCancelButton && 'flex gap-3')}>
            {showCancelButton && (
              <button
                onClick={handleCancel}
                className={clsx(
                  'p-4 border border-primary-b60 bg-grayscale-0 text-primary-b60 hover:bg-primary-b60 hover:text-grayscale-0 rounded-xl button_transition font-semibold',
                  showCancelButton ? 'flex-1' : 'w-full',
                )}
                type="button"
              >
                {cancelText}
              </button>
            )}
            <button
              onClick={handleConfirm}
              className={clsx(
                'p-4 bg-primary text-primary-b80 rounded-xl hover:bg-primary/80 button_transition font-semibold',
                showCancelButton ? 'flex-1' : 'w-full',
              )}
              type="button"
              autoFocus
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
