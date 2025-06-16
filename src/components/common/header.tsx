'use client';

import { usePathname, useRouter } from 'next/navigation';
import SvgIcon from './svg_icon';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useFeedStore } from '@/store/feed';
import { useAuthStore } from '@/store/auth';
import clsx from 'clsx';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();
  const isPostsPage = pathname === '/posts';
  const isPostWritePage = pathname === '/posts/write';
  const isPostDetailPage =
    pathname.startsWith('/posts/') && pathname !== '/posts/write';
  const isMyPage = pathname === '/my_page';
  const isEditMyPage = pathname === '/my_page/edit';

  const shouldShowHeader =
    isPostsPage ||
    isPostWritePage ||
    isPostDetailPage ||
    isMyPage ||
    isEditMyPage;

  const [showFeedMenu, setShowFeedMenu] = useState(false);
  const [showMeatballMenu, setShowMeatballMenu] = useState(false);
  const { feedType, setFeedType } = useFeedStore();

  const handleLogout = () => {
    logout();
    router.push('/');
    setShowMeatballMenu(false);
  };

  // 게시글 관련 페이지가 아닐 경우 헤더를 렌더링하지 않음
  if (!shouldShowHeader) return null;

  return (
    <header
      className={clsx(
        'hidden max-md:block w-full h-[64px] bg-grayscale-0 fixed top-0 left-0 z-50 border-b border-[var(--grayscale-10)]',
      )}
    >
      <div
        className={clsx(
          'flex items-center h-full',
          isPostWritePage || isMyPage
            ? 'justify-center'
            : 'justify-between px-4',
        )}
      >
        <div
          className={clsx(
            'flex items-center relative',
            !(isPostWritePage || isMyPage) && 'justify-between',
          )}
        >
          {isEditMyPage ? (
            <div className="flex">
              <button
                onClick={() => router.push('/my_page')}
                aria-label="뒤로 가기"
              >
                <SvgIcon name="arrow_left" width={24} height={24} />
              </button>
              <span className="text-lg font-semibold">개인정보 수정</span>
            </div>
          ) : isPostDetailPage ? (
            <button
              onClick={() => router.push('/posts')}
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
                  className={clsx(
                    'transform transition-transform duration-200',
                    showFeedMenu && 'rotate-180',
                  )}
                />
              </button>

              <AnimatePresence>
                {showFeedMenu && (
                  <motion.div
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="absolute left-0 top-[48px] bg-grayscale-0 rounded-lg shadow-lg border border-gray-100  z-50 min-w-[80px] text-center text-sm"
                  >
                    <motion.button
                      initial={{ y: -5, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      onClick={() => {
                        setFeedType('all');
                        setShowFeedMenu(false);
                      }}
                      className={clsx(
                        'w-full px-5 py-[10px] hover:bg-primary-w80 hover:text-primary-b80 rounded-t-lg',
                        feedType === 'all'
                          ? 'text-[var(--primary)] font-medium'
                          : 'text-[var(--grayscale-40)]',
                      )}
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
                      className={clsx(
                        'w-full px-5 py-[10px] hover:bg-primary-w80 hover:text-primary-b80 rounded-b-lg',
                        feedType === 'hobby'
                          ? 'text-[var(--primary)] font-medium'
                          : 'text-[var(--grayscale-40)]',
                      )}
                    >
                      취미 피드
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <span className="text-lg font-semibold">
              {isPostWritePage
                ? '게시글 작성'
                : isMyPage
                  ? '마이페이지'
                  : '게시글'}
            </span>
          )}
        </div>

        {/* 전체 메뉴 버튼 - 게시글 상세 페이지, 작성 페이지, 마이페이지, 개인정보 수정 페이지에서는 숨김 */}
        {!isPostDetailPage &&
          !isPostWritePage &&
          !isMyPage &&
          !isEditMyPage && (
            <div className="relative">
              <button
                className="flex items-center justify-center w-[24px] h-[24px]"
                onClick={() => setShowMeatballMenu(!showMeatballMenu)}
              >
                <SvgIcon name="meatball" width={24} height={24} />
              </button>

              <AnimatePresence>
                {showMeatballMenu && (
                  <motion.div
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="absolute right-0 top-[48px] bg-grayscale-0 rounded-lg shadow-lg border border-gray-100 z-50 min-w-[100px]"
                  >
                    <motion.button
                      initial={{ y: -5, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      onClick={handleLogout}
                      className="w-full px-5 py-[10px] text-sm text-center text-[var(--grayscale-60)] hover:bg-[var(--primary-w80)] rounded-lg"
                    >
                      로그아웃
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
      </div>
    </header>
  );
}
