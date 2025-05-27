import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import SvgIcon from '../common/svg_icon';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * 스플래시 화면 컴포넌트 Props 인터페이스
 * @param onFinish - 스플래시 화면 종료 핸들러
 */
interface SplashScreenProps {
  onFinish: () => void;
}

/**
 * 스플래시 화면 컴포넌트
 *
 * 주요 기능
 * 1. 로고가 페이드인되며 등장
 * 2. 2초 후에 위로 이동하는 애니메이션 시작
 * 3. 3초 후에 스플래시 스크린을 닫기
 */
export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [mounted, setMounted] = useState<boolean>(false); // 컴파운드 컴포넌트 마운트 여부
  const [isAnimating, setIsAnimating] = useState<boolean>(false); // 애니메이션 실행 여부

  useEffect(() => {
    setMounted(true);

    // 2초 후에 애니메이션 시작
    const animationTimer = setTimeout(() => {
      setIsAnimating(true);
    }, 2000);

    // 3초 후에 스플래시 스크린을 닫기
    const finishTimer = setTimeout(() => {
      onFinish();
    }, 3000);

    // 컴포넌트가 언마운트될 때 타이머 정리
    return () => {
      clearTimeout(animationTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  // 스플래시 화면이 표시될 때 body 스크롤 방지
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!mounted) return null;

  // splash-screen이 없으면 body에 fallback
  const portalElement =
    typeof document !== 'undefined'
      ? document.getElementById('splash-screen') || document.body
      : null;

  if (!portalElement) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-grayscale-100">
      <AnimatePresence>
        <motion.div
          className={`flex flex-col items-center transition-all duration-1000 ease-in-out
            ${isAnimating ? 'transform -translate-y-[38vh]' : ''}`}
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.8,
            ease: [0.43, 0.13, 0.23, 0.96],
          }}
        >
          <SvgIcon
            name="logo"
            className="w-[240px] h-[70px] max-md:w-[150px] max-md:h-[44px]"
          />
        </motion.div>
      </AnimatePresence>
    </div>,
    portalElement,
  );
}
