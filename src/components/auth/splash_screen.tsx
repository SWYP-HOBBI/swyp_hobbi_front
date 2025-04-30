import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import SvgIcon from '../common/svg_icon';

interface SplashScreenProps {
  onFinish: () => void;
}

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

    return () => {
      clearTimeout(animationTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  useEffect(() => {
    // 스플래시 화면이 표시될 때 body 스크롤 방지
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div
        className={`flex flex-col items-center transition-all duration-1000 ease-in-out
          ${isAnimating ? 'transform -translate-y-[38vh]' : ''}`}
      >
        <SvgIcon name="logo" width={240} height={70} />
      </div>
    </div>,
    portalElement,
  );
}
