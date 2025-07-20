/**
 * useIsMobile 커스텀 훅
 *
 * 이 훅은 현재 브라우저의 화면 너비가 모바일 기준(784px 이하)인지 여부를 실시간으로 감지하여 반환합니다.
 * 여러 컴포넌트에서 중복되는 window.innerWidth 체크 및 resize 이벤트 리스너 코드를 대체할 수 있습니다.
 *
 * 사용 예시:
 *   const isMobile = useIsMobile();
 *   if (isMobile) { ... } // 모바일 화면일 때 분기 처리
 *
 * - 모바일 기준이 바뀌면 MOBILE_WIDTH 상수만 수정하면 됩니다.
 * - 언마운트 시 이벤트 리스너도 자동으로 정리됩니다.
 */
import { useState, useEffect } from 'react';

// 모바일 화면 기준 너비(px)
const MOBILE_WIDTH = 784;

/**
 * 현재 화면이 모바일(784px 이하)인지 여부를 반환하는 커스텀 훅
 * @returns {boolean} isMobile - 모바일 화면 여부
 */
export const useIsMobile = () => {
  // isMobile: 현재 화면이 모바일인지 여부를 저장하는 상태
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // 화면 크기 변경 시 호출되는 함수
    const handleResize = () => {
      // window.innerWidth가 MOBILE_WIDTH 이하이면 모바일로 간주
      setIsMobile(window.innerWidth <= MOBILE_WIDTH);
    };

    // 마운트 시 한 번 실행하여 초기값 설정
    handleResize();

    // resize 이벤트 리스너 등록 (화면 크기 변경 감지)
    window.addEventListener('resize', handleResize);

    // 언마운트 시 이벤트 리스너 정리(메모리 누수 방지)
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 모바일 여부 반환
  return isMobile;
};
