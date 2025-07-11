import { useEffect, useState } from 'react';

/**
 * FloatingToast 컴포넌트
 *
 * 주요 기능:
 * - 마우스 커서를 따라다니는 플로팅 토스트 메시지
 * - share-button 기준 초기 위치 설정
 * - 자동 타이머로 메시지 자동 닫기
 * - 마우스 이동 시 실시간 위치 업데이트
 * - pointer-events-none으로 마우스 이벤트 방해 방지
 *
 * UX 특징:
 * - 사용자 액션에 대한 즉각적인 피드백 제공
 * - 마우스 커서 근처에 표시되어 시각적 주의 집중
 * - 자동 사라짐으로 UI 클러터 방지
 *
 * 기술적 특징:
 * - TypeScript로 타입 안전성 보장
 * - useEffect로 생명주기 관리
 * - DOM 요소 직접 접근 (getBoundingClientRect)
 * - 이벤트 리스너 정리로 메모리 누수 방지
 */

// ===== Props 인터페이스 =====

/**
 * FloatingToast Props 타입 정의
 */
interface FloatingToastProps {
  /** 표시할 메시지 내용 (필수) */
  message: string;
  /** 토스트 표시 지속 시간 (밀리초, 기본값: 3000ms) */
  duration?: number;
  /** 토스트 닫기 콜백 함수 (필수) */
  onClose: () => void;
}

// ===== 메인 컴포넌트 =====

/**
 * 마우스를 따라다니는 플로팅 토스트 메시지 컴포넌트
 *
 * @param message - 표시할 메시지
 * @param duration - 표시 지속 시간 (기본값: 3000ms)
 * @param onClose - 닫기 콜백 함수
 */
export default function FloatingToast({
  message,
  duration = 3000,
  onClose,
}: FloatingToastProps) {
  /**
   * 토스트 위치 상태
   * - x, y: 화면상의 픽셀 좌표
   * - 초기값: 화면 밖 (-100, -100)으로 설정하여 깜빡임 방지
   */
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: -100,
    y: -100,
  });

  // ===== 사이드 이펙트 =====

  /**
   * 최초 위치 계산 (share-button 기준)
   *
   * 동작 과정:
   * 1. window 객체 존재 확인 (SSR 안전성)
   * 2. share-button DOM 요소 찾기
   * 3. getBoundingClientRect()로 요소의 위치/크기 정보 획득
   * 4. 버튼 오른쪽 끝 + 10px, 버튼 세로 중앙에 위치 설정
   *
   * 의존성 배열이 빈 배열이므로 컴포넌트 마운트 시 한 번만 실행
   */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const shareButton = document.getElementById('share-button');
      if (shareButton) {
        const rect = shareButton.getBoundingClientRect();
        setPosition({
          x: rect.right + 10, // 버튼 오른쪽 끝 + 10px 여백
          y: rect.top + rect.height / 2, // 버튼 세로 중앙
        });
      }
    }
  }, []);

  /**
   * 마우스 이동 추적 및 자동 타이머 관리
   *
   * 동작 과정:
   * 1. mousemove 이벤트 리스너 등록
   * 2. 마우스 위치 + 15px 오프셋으로 토스트 위치 업데이트
   * 3. duration 후 자동으로 onClose 호출
   * 4. 컴포넌트 언마운트 시 이벤트 리스너와 타이머 정리
   *
   * 의존성: duration, onClose 변경 시 재실행
   */
  useEffect(() => {
    /**
     * 마우스 이동 핸들러
     * - clientX, clientY: 뷰포트 기준 마우스 좌표
     * - +15px 오프셋: 마우스 커서와 토스트 간 적절한 간격 유지
     */
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX + 15,
        y: e.clientY + 15,
      });
    };

    // 마우스 이동 이벤트 리스너 등록
    window.addEventListener('mousemove', handleMouseMove);

    // 자동 닫기 타이머 설정
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    /**
     * 클린업 함수
     * - 이벤트 리스너 제거로 메모리 누수 방지
     * - 타이머 정리로 불필요한 onClose 호출 방지
     */
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timer);
    };
  }, [duration, onClose]);

  // ===== 렌더링 =====

  return (
    <div
      className="fixed z-50 bg-grayscale-10 text-grayscale-60 p-[10px] rounded-sm text-xs pointer-events-none"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      {message}
    </div>
  );
}
