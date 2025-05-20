'use client';

import { usePathname, useRouter } from 'next/navigation';
import SvgIcon from './svg_icon';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useFeedStore } from '@/store/feed';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const isPostsPage = pathname === '/posts';
  const isPostWritePage = pathname === '/posts/write';
  const isPostDetailPage =
    pathname.startsWith('/posts/') && pathname !== '/posts/write';
  const shouldShowHeader = isPostsPage || isPostWritePage || isPostDetailPage;
  const [showFeedMenu, setShowFeedMenu] = useState(false);
  const { feedType, setFeedType } = useFeedStore();

  // 게시글 관련 페이지가 아닐 경우 헤더를 렌더링하지 않음
  if (!shouldShowHeader) return null;

  return (
    <header className="hidden max-md:block w-full h-[64px] bg-white fixed top-0 left-0 z-50 border-b border-[var(--grayscale-10)]">
      <div className="flex items-center justify-between px-4 h-full">
        <div className="flex items-center relative">
          {isPostDetailPage ? (
            <button
              onClick={() => router.back()}
              className="flex items-center justify-center"
              aria-label="뒤로 가기"
            >
              <SvgIcon name="arrow_left" width={24} height={24} />
            </button>
          ) : isPostsPage ? (
            <>
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
            </>
          ) : (
            <span className="text-[18px] font-semibold">
              {isPostWritePage ? '게시글 작성' : '게시글'}
            </span>
          )}
        </div>

        {/* 전체 메뉴 버튼 - 게시글 상세 페이지에서는 숨김 */}
        {!isPostDetailPage && (
          <button className="flex items-center justify-center w-[24px] h-[24px]">
            <SvgIcon name="meatball" width={24} height={24} />
          </button>
        )}
      </div>
    </header>
  );
}
