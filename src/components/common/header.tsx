'use client';

import { usePathname } from 'next/navigation';
import SvgIcon from './svg_icon';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useFeedStore } from '@/store/feed';

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === '/posts';
  const [showFeedMenu, setShowFeedMenu] = useState(false);
  const { feedType, setFeedType } = useFeedStore();

  // 홈 화면이 아닐 경우 헤더를 렌더링하지 않음
  if (!isHome) return null;

  return (
    <header className="hidden max-md:block w-full h-[56px] bg-white fixed top-0 left-0 z-50 border-b border-[var(--grayscale-10)]">
      <div className="flex items-center justify-between px-4 h-full">
        <div className="flex items-center relative">
          <button
            onClick={() => setShowFeedMenu(!showFeedMenu)}
            className="flex items-center space-x-1"
          >
            <span className="text-[18px] font-semibold">
              {feedType === 'all' ? '전체 피드' : '취미 피드'}
            </span>
            <SvgIcon
              name="arrow_down"
              width={24}
              height={24}
              className={`transform transition-transform duration-200 ${
                showFeedMenu ? 'rotate-180' : ''
              }`}
            />
          </button>

          <AnimatePresence>
            {showFeedMenu && (
              <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="absolute left-0 top-[48px] bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50 min-w-[120px]"
              >
                <motion.button
                  initial={{ y: -5, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  onClick={() => {
                    setFeedType('all');
                    setShowFeedMenu(false);
                  }}
                  className={`w-full px-4 py-2 text-left hover:bg-[var(--primary-w80)] ${
                    feedType === 'all'
                      ? 'text-[var(--primary)] font-medium'
                      : 'text-[var(--grayscale-60)]'
                  }`}
                >
                  전체 피드
                </motion.button>
                <motion.button
                  initial={{ y: -5, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  onClick={() => {
                    setFeedType('hobby');
                    setShowFeedMenu(false);
                  }}
                  className={`w-full px-4 py-2 text-left hover:bg-[var(--primary-w80)] ${
                    feedType === 'hobby'
                      ? 'text-[var(--primary)] font-medium'
                      : 'text-[var(--grayscale-60)]'
                  }`}
                >
                  취미 피드
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 전체 메뉴 버튼 */}
        <button className="flex items-center justify-center w-[24px] h-[24px]">
          <SvgIcon name="meatball" width={24} height={24} />
        </button>
      </div>
    </header>
  );
}
