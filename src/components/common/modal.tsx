'use client';

import { useModalStore } from '@/store/modal';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

/**
 * Modal 컴포넌트
 *
 * 주요 기능:
 * - 전역 모달 시스템 (Zustand 스토어 기반)
 * - 다양한 모달 타입 지원 (default, error 등)
 * - 페이지별 조건부 패딩 (PC 사이드바 고려)
 * - 스크롤 방지 및 복원
 * - React Portal을 통한 DOM 분리 렌더링
 * - 접근성 고려 (ARIA 속성, 키보드 포커스)
 *
 * 모달 타입:
 * - default: 일반 모달 (회색 텍스트)
 * - error: 에러 모달 (빨간색 텍스트)
 *
 * 버튼 구성:
 * - 확인 버튼만: 기본 구성
 * - 확인 + 취소 버튼: showCancelButton = true
 * - 버튼 숨김: hideButtons = true
 *
 * UX 특징:
 * - 배경 클릭으로 닫기 방지 (명시적 액션 필요)
 * - 자동 포커스 (autoFocus)
 * - 부드러운 트랜지션 효과
 * - 반응형 디자인 (모바일/PC)
 *
 * 기술적 특징:
 * - React Portal로 DOM 계층 분리
 * - Zustand 스토어로 전역 상태 관리
 * - 조건부 스타일링으로 페이지별 최적화
 * - 메모리 누수 방지를 위한 cleanup
 */

/**
 * 전역 모달 컴포넌트
 *
 * 동작 과정:
 * 1. Zustand 스토어에서 모달 상태 및 설정 가져오기
 * 2. 현재 페이지 경로 확인하여 패딩 여부 결정
 * 3. 모달 열림 시 스크롤 방지, 닫힘 시 복원
 * 4. React Portal을 통해 DOM 최상위에 렌더링
 * 5. 버튼 클릭 시 콜백 실행 후 모달 닫기
 *
 * 스토어 연동:
 * - isOpen: 모달 표시 여부
 * - type: 모달 타입 (스타일 결정)
 * - title, message: 모달 내용
 * - confirmText, cancelText: 버튼 텍스트
 * - onConfirm, onCancel: 버튼 클릭 콜백
 * - showCancelButton, hideButtons: 버튼 구성 옵션
 * - closeModal: 모달 닫기 함수
 */
export default function Modal() {
  // ===== Zustand 스토어 연동 =====

  /**
   * 모달 관련 상태 및 액션
   * Zustand 스토어에서 모달의 모든 설정을 가져옴
   */
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

  // ===== 페이지별 조건 판단 =====

  /**
   * 현재 페이지 경로
   * 페이지별로 다른 레이아웃 적용을 위해 사용
   */
  const pathname = usePathname();

  /**
   * PC 사이드바 고려한 패딩 추가 여부
   * - /posts: 메인 피드 (사이드바 있음)
   * - /my_page: 마이페이지 (사이드바 있음)
   * - /posts/write: 게시글 작성 (사이드바 있음)
   *
   * PC에서 사이드바(240px)가 있는 페이지에서는
   * 모달 위치를 조정하여 사이드바와 겹치지 않도록 함
   */
  const shouldAddPadding =
    pathname === '/posts' || // 메인 피드
    pathname === '/my_page' || // 마이페이지
    pathname === '/posts/write'; // 게시글 작성

  // ===== 사이드 이펙트 =====

  /**
   * 모달 열림/닫힘에 따른 스크롤 제어
   *
   * 동작:
   * - 모달 열림: body overflow = 'hidden' (스크롤 방지)
   * - 모달 닫힘: body overflow = 'unset' (스크롤 복원)
   * - 컴포넌트 언마운트: 스크롤 복원 (cleanup)
   *
   * 목적:
   * - 모달 배경 스크롤 방지
   * - 모달 내용에 집중할 수 있도록 UX 개선
   * - 메모리 누수 방지
   */
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

  // ===== 조건부 렌더링 =====

  /**
   * 모달이 닫혀있으면 렌더링하지 않음
   * 성능 최적화를 위한 early return
   */
  if (!isOpen) return null;

  // ===== Portal 요소 찾기 =====

  /**
   * React Portal을 위한 DOM 요소 찾기
   *
   * 우선순위:
   * 1. 'modal-portal' ID를 가진 요소 (커스텀 포탈)
   * 2. document.body (기본 포탈)
   * 3. null (SSR 환경)
   *
   * SSR 안전성을 위해 typeof document 체크
   */
  const portalElement =
    typeof document !== 'undefined'
      ? document.getElementById('modal-portal') || document.body
      : null;

  if (!portalElement) return null;

  // ===== 이벤트 핸들러 =====

  /**
   * 확인 버튼 클릭 핸들러
   *
   * 동작:
   * 1. onConfirm 콜백 실행 (옵셔널)
   * 2. 모달 닫기
   *
   * 콜백이 없어도 모달은 닫힘
   */
  const handleConfirm = () => {
    onConfirm?.();
    closeModal();
  };

  /**
   * 취소 버튼 클릭 핸들러
   *
   * 동작:
   * 1. onCancel 콜백 실행 (옵셔널)
   * 2. 모달 닫기
   *
   * 콜백이 없어도 모달은 닫힘
   */
  const handleCancel = () => {
    onCancel?.();
    closeModal();
  };

  // ===== 렌더링 =====

  /**
   * React Portal을 통해 DOM 최상위에 모달 렌더링
   *
   * Portal의 장점:
   * - DOM 계층 분리로 z-index 문제 해결
   * - 부모 컴포넌트의 overflow, transform 등에 영향받지 않음
   * - 전역 모달 시스템 구현 가능
   */
  return createPortal(
    <div
      className={clsx(
        'fixed inset-0 z-50 flex items-center justify-center',
        // 기본 스타일: 전체 화면 고정, 높은 z-index, 중앙 정렬
        shouldAddPadding && 'md:pl-[280px]', // PC에서 사이드바 고려한 패딩
      )}
      role="dialog" // 접근성: 대화상자 역할 명시
      aria-modal="true" // 접근성: 모달임을 스크린 리더에 알림
    >
      {/* ===== 배경 오버레이 ===== */}
      <div
        className="absolute inset-0 bg-grayscale-100/50"
        aria-hidden="true" // 접근성: 배경은 스크린 리더에서 무시
      />

      {/* ===== 모달 컨텐츠 ===== */}
      <div className="space-y-6 p-11 relative bg-grayscale-0 rounded-xl w-full max-w-[360px] flex flex-col items-center text-center shadow-md mx-4 md:mx-0">
        {/* ===== 제목 및 메시지 ===== */}
        <div
          className={clsx(
            'font-semibold text-xl',
            type === 'error' ? 'text-like' : 'text-grayscale-100', // 타입별 색상
          )}
        >
          {title && <h2>{title}</h2>}
          {message && (
            <p className="whitespace-pre-line text-base mt-2">{message}</p>
            // whitespace-pre-line: 줄바꿈 문자(\n) 지원
          )}
        </div>

        {/* ===== 버튼 영역 ===== */}
        {!hideButtons && (
          <div className={clsx('w-full', showCancelButton && 'flex gap-3')}>
            {/* ===== 취소 버튼 (조건부 표시) ===== */}
            {showCancelButton && (
              <button
                onClick={handleCancel}
                className={clsx(
                  'p-4 border border-primary-b60 bg-grayscale-0 text-primary-b60 hover:bg-primary-b60 hover:text-grayscale-0 rounded-xl button_transition font-semibold',
                  // 기본: 테두리만, hover: 배경색 변경
                  showCancelButton ? 'flex-1' : 'w-full', // 취소 버튼이 있으면 flex-1, 없으면 전체 너비
                )}
                type="button"
              >
                {cancelText}
              </button>
            )}

            {/* ===== 확인 버튼 ===== */}
            <button
              onClick={handleConfirm}
              className={clsx(
                'p-4 bg-primary text-primary-b80 rounded-xl hover:bg-primary/80 button_transition font-semibold',
                // 기본: 파란색 배경, hover: 투명도 적용
                showCancelButton ? 'flex-1' : 'w-full', // 취소 버튼이 있으면 flex-1, 없으면 전체 너비
              )}
              type="button"
              autoFocus // 접근성: 모달 열림 시 자동 포커스
            >
              {confirmText}
            </button>
          </div>
        )}
      </div>
    </div>,
    portalElement, // Portal 대상 요소
  );
}
