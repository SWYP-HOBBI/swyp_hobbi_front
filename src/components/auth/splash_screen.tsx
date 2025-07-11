import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import SvgIcon from '../common/svg_icon';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * 스플래시 화면 컴포넌트 Props 인터페이스
 *
 * @param onFinish - 스플래시 화면이 완료되었을 때 호출되는 콜백 함수
 *                   부모 컴포넌트에서 스플래시 화면을 닫고 다음 화면으로 이동하는 로직을 처리
 */
interface SplashScreenProps {
  onFinish: () => void;
}

/**
 * 타이핑 효과를 구현하는 컴포넌트
 *
 * 텍스트가 한 글자씩 타이핑되는 애니메이션을 제공합니다.
 * 커서 깜빡임 효과도 함께 구현되어 있습니다.
 *
 * @param text - 타이핑할 텍스트 문자열
 */
function TypewriterText({ text }: { text: string }) {
  // ===== 상태 관리 =====
  /**
   * 현재까지 표시된 텍스트
   * 타이핑 효과를 위해 한 글자씩 누적되는 문자열
   */
  const [displayedText, setDisplayedText] = useState('');

  /**
   * 현재 타이핑 중인 글자의 인덱스
   * text 문자열의 어느 위치까지 타이핑되었는지 추적
   */
  const [currentIndex, setCurrentIndex] = useState(0);

  // ===== 타이핑 효과 로직 =====
  useEffect(() => {
    // 모든 글자를 타이핑하지 않았다면 계속 진행
    if (currentIndex < text.length) {
      // 100ms마다 한 글자씩 추가
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 100); // 각 글자가 나타나는 속도 (밀리초)

      // 컴포넌트가 언마운트되거나 의존성이 변경될 때 타이머 정리
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text]);

  return (
    <motion.p
      className="mt-4 text-grayscale-80 text-lg max-md:text-base"
      // ===== 페이드인 애니메이션 =====
      initial={{ opacity: 0 }} // 초기 상태: 투명
      animate={{ opacity: 1 }} // 애니메이션 후: 완전 불투명
      transition={{
        duration: 0.5, // 애니메이션 지속 시간
        ease: 'easeOut', // 부드러운 감속 효과
      }}
    >
      {/* 타이핑된 텍스트 표시 */}
      {displayedText}

      {/* ===== 커서 깜빡임 효과 ===== */}
      <motion.span
        animate={{ opacity: [0, 1, 0] }} // 투명 → 불투명 → 투명 반복
        transition={{
          duration: 0.8, // 한 번의 깜빡임 주기
          repeat: Infinity, // 무한 반복
          ease: 'linear', // 선형 애니메이션 (일정한 속도)
        }}
        className="inline-block ml-1" // 커서와 텍스트 사이 간격
      >
        |
      </motion.span>
    </motion.p>
  );
}

/**
 * 스플래시 화면 메인 컴포넌트
 *
 * 앱 시작 시 사용자에게 보여지는 인트로 화면입니다.
 *
 * 주요 기능:
 * 1. 로고가 페이드인되며 등장
 * 2. 타이핑 효과로 슬로건 표시
 * 3. 3초 후 자동으로 스플래시 화면 종료
 * 4. Portal을 사용하여 최상위 레이어에 렌더링
 * 5. 스크롤 방지 및 전체 화면 오버레이
 *
 * 기술적 특징:
 * - Framer Motion을 사용한 부드러운 애니메이션
 * - React Portal을 통한 모달형 렌더링
 * - 반응형 디자인 (모바일/데스크톱)
 * - SSR 호환성을 위한 마운트 상태 관리
 */
export default function SplashScreen({ onFinish }: SplashScreenProps) {
  // ===== SSR 호환성을 위한 마운트 상태 관리 =====
  /**
   * 컴포넌트가 클라이언트에서 마운트되었는지 확인
   * SSR 환경에서 hydration 불일치를 방지하기 위해 사용
   */
  const [mounted, setMounted] = useState<boolean>(false);

  // ===== 스플래시 화면 타이머 관리 =====
  useEffect(() => {
    // 컴포넌트가 마운트되었음을 표시
    setMounted(true);

    // 3초 후에 스플래시 스크린을 자동으로 닫기
    const finishTimer = setTimeout(() => {
      onFinish(); // 부모 컴포넌트에 완료 신호 전달
    }, 3000); // 3초 (3000ms)

    // 컴포넌트가 언마운트될 때 타이머 정리 (메모리 누수 방지)
    return () => {
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  // ===== 스크롤 방지 관리 =====
  useEffect(() => {
    // 스플래시 화면이 표시될 때 body 스크롤을 방지
    // 전체 화면 오버레이 효과를 위해 필요
    document.body.style.overflow = 'hidden';

    // 컴포넌트가 언마운트될 때 스크롤 복원
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // ===== SSR 환경에서의 안전한 렌더링 =====
  // 컴포넌트가 마운트되지 않았다면 아무것도 렌더링하지 않음
  if (!mounted) return null;

  // ===== Portal 대상 요소 찾기 =====
  /**
   * 스플래시 화면을 렌더링할 DOM 요소를 찾습니다.
   *
   * 우선순위:
   * 1. id가 'splash-screen'인 요소
   * 2. 없으면 document.body
   * 3. SSR 환경에서는 null
   */
  const portalElement =
    typeof document !== 'undefined'
      ? document.getElementById('splash-screen') || document.body
      : null;

  // Portal 대상 요소가 없으면 렌더링하지 않음
  if (!portalElement) return null;

  // ===== JSX 렌더링 =====
  return createPortal(
    // ===== 전체 화면 오버레이 컨테이너 =====
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-grayscale-0">
      {/* ===== Framer Motion 애니메이션 컨테이너 ===== */}
      <AnimatePresence>
        <motion.div
          className="flex flex-col items-center"
          // ===== 페이드인/아웃 애니메이션 =====
          initial={{ opacity: 0 }} // 초기 상태: 투명
          animate={{ opacity: 1 }} // 애니메이션 후: 완전 불투명
          exit={{ opacity: 0 }} // 종료 시: 투명
          transition={{
            duration: 0.8, // 애니메이션 지속 시간
            ease: 'easeOut', // 부드러운 감속 효과
          }}
        >
          {/* ===== 로고 섹션 ===== */}
          <SvgIcon
            name="logo"
            className="w-[240px] h-[70px] max-md:w-[150px] max-md:h-[44px]"
          />

          {/* ===== 타이핑 효과 슬로건 ===== */}
          <TypewriterText text="취미로 연결되는 우리들의 이야기" />
        </motion.div>
      </AnimatePresence>
    </div>,
    portalElement, // Portal 대상 요소
  );
}
