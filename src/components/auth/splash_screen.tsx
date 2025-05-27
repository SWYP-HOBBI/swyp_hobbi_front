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

// 타이핑 효과를 위한 컴포넌트
function TypewriterText({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 100); // 각 글자가 나타나는 속도 (밀리초)

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text]);

  return (
    <motion.p
      className="mt-4 text-grayscale-80 text-lg max-md:text-base"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{
        duration: 0.5,
        ease: 'easeOut',
      }}
    >
      {displayedText}
      <motion.span
        animate={{ opacity: [0, 1, 0] }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="inline-block ml-1"
      >
        |
      </motion.span>
    </motion.p>
  );
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
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);

    // 3초 후에 스플래시 스크린을 닫기
    const finishTimer = setTimeout(() => {
      onFinish();
    }, 3000);

    // 컴포넌트가 언마운트될 때 타이머 정리
    return () => {
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

  const portalElement =
    typeof document !== 'undefined'
      ? document.getElementById('splash-screen') || document.body
      : null;

  if (!portalElement) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-grayscale-0">
      <AnimatePresence>
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.8,
            ease: 'easeOut',
          }}
        >
          <SvgIcon
            name="logo"
            className="w-[240px] h-[70px] max-md:w-[150px] max-md:h-[44px]"
          />
          <TypewriterText text="취미로 연결되는 우리들의 이야기" />
        </motion.div>
      </AnimatePresence>
    </div>,
    portalElement,
  );
}
