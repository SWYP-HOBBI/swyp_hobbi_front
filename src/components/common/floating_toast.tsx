import { useEffect, useState } from 'react';

interface FloatingToastProps {
  message: string;
  duration?: number;
  onClose: () => void;
}

export default function FloatingToast({
  message,
  duration = 3000,
  onClose,
}: FloatingToastProps) {
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: -100,
    y: -100,
  });

  // 최초 위치 계산 (share-button 기준)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const shareButton = document.getElementById('share-button');
      if (shareButton) {
        const rect = shareButton.getBoundingClientRect();
        setPosition({
          x: rect.right + 10,
          y: rect.top + rect.height / 2,
        });
      }
    }
  }, []);

  // 마우스 이동 및 타이머 관리
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX + 15, y: e.clientY + 15 });
    };
    window.addEventListener('mousemove', handleMouseMove);
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timer);
    };
  }, [duration, onClose]);

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
