'use client';

import { usePathname, useRouter } from 'next/navigation';
import SvgIcon from './svg_icon';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useFeedStore } from '@/store/feed';
import { useAuthStore } from '@/store/auth';
import clsx from 'clsx';

/**
 * Header 컴포넌트
 *
 * 주요 기능:
 * - 모바일 전용 헤더 (max-md:block, hidden)
 * - 페이지별 조건부 렌더링 및 내용 변경
 * - 피드 타입 선택 드롭다운 (전체/취미)
 * - 메뉴 버튼 (로그아웃 등)
 * - 뒤로가기 버튼 (상세/수정 페이지)
 * - Framer Motion 애니메이션 적용
 *
 * 페이지별 헤더 내용:
 * - /posts: 피드 타입 선택 + 메뉴 버튼
 * - /posts/write: "게시글 작성" 제목 (중앙 정렬)
 * - /posts/[id]: 뒤로가기 버튼
 * - /my_page: "마이페이지" 제목 (중앙 정렬)
 * - /my_page/edit: 뒤로가기 + "개인정보 수정" 제목
 *
 * UX 특징:
 * - 모바일에서만 표시 (PC는 TabBar 사용)
 * - 고정 위치 (fixed top-0)
 * - 높은 z-index (z-50)로 다른 요소 위에 표시
 * - 부드러운 애니메이션으로 드롭다운 표시/숨김
 */

export default function Header() {
  // ===== 라우팅 및 상태 관리 =====

  /**
   * Next.js 라우팅 훅
   * - pathname: 현재 경로 (페이지별 헤더 내용 결정)
   * - router: 페이지 이동 함수
   */
  const pathname = usePathname();
  const router = useRouter();

  /**
   * Zustand 스토어
   * - logout: 로그아웃 함수
   * - feedType, setFeedType: 피드 타입 상태 (전체/취미)
   */
  const { logout } = useAuthStore();
  const { feedType, setFeedType } = useFeedStore();

  // ===== 페이지별 조건 판단 =====

  /**
   * 현재 페이지 타입 판단
   * 각 페이지별로 다른 헤더 내용과 레이아웃 적용
   */
  const isPostsPage = pathname === '/posts';
  const isPostWritePage = pathname === '/posts/write';
  const isPostDetailPage =
    pathname.startsWith('/posts/') && pathname !== '/posts/write';
  const isMyPage = pathname === '/my_page';
  const isEditMyPage = pathname === '/my_page/edit';

  /**
   * 헤더 표시 여부 결정
   * 게시글 관련 페이지와 마이페이지에서만 헤더 표시
   */
  const shouldShowHeader =
    isPostsPage ||
    isPostWritePage ||
    isPostDetailPage ||
    isMyPage ||
    isEditMyPage;

  // ===== 로컬 상태 관리 =====

  /**
   * 드롭다운 메뉴 상태
   * - showFeedMenu: 피드 타입 선택 드롭다운 표시 여부
   * - showMeatballMenu: 메뉴 버튼 드롭다운 표시 여부
   */
  const [showFeedMenu, setShowFeedMenu] = useState(false);
  const [showMeatballMenu, setShowMeatballMenu] = useState(false);

  // ===== 이벤트 핸들러 =====

  /**
   * 로그아웃 처리
   * - 로그아웃 실행
   * - 홈 페이지로 이동
   * - 메뉴 드롭다운 닫기
   */
  const handleLogout = () => {
    logout();
    router.push('/');
    setShowMeatballMenu(false);
  };

  // ===== 조건부 렌더링 =====

  /**
   * 게시글 관련 페이지가 아닐 경우 헤더를 렌더링하지 않음
   * 다른 페이지에서는 헤더가 필요하지 않거나 다른 네비게이션 사용
   */
  if (!shouldShowHeader) return null;

  return (
    <header
      className={clsx(
        'hidden max-md:block w-full h-[64px] bg-grayscale-0 fixed top-0 left-0 z-50 border-b border-[var(--grayscale-10)]',
        // hidden max-md:block: PC에서는 숨기고 모바일에서만 표시
        // w-full h-[64px]: 전체 너비, 64px 높이
        // fixed top-0 left-0: 상단 고정 위치
        // z-50: 높은 z-index로 다른 요소 위에 표시
        // border-b: 하단 테두리
      )}
    >
      <div
        className={clsx(
          'flex items-center h-full',
          isPostWritePage || isMyPage
            ? 'justify-center' // 작성/마이페이지: 중앙 정렬
            : 'justify-between px-4', // 기타 페이지: 좌우 분산 + 패딩
        )}
      >
        <div
          className={clsx(
            'flex items-center relative',
            !(isPostWritePage || isMyPage) && 'justify-between',
          )}
        >
          {/* ===== 페이지별 헤더 내용 ===== */}

          {isEditMyPage ? (
            /**
             * 개인정보 수정 페이지
             * - 뒤로가기 버튼 + "개인정보 수정" 제목
             */
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
            /**
             * 게시글 상세 페이지
             * - 뒤로가기 버튼만 표시 (피드로 이동)
             */
            <button
              onClick={() => router.push('/posts')}
              className="flex items-center justify-center"
              aria-label="뒤로 가기"
            >
              <SvgIcon name="arrow_left" width={24} height={24} />
            </button>
          ) : isPostsPage ? (
            /**
             * 피드 페이지
             * - 피드 타입 선택 드롭다운 (전체/취미)
             * - Framer Motion 애니메이션 적용
             */
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
                    showFeedMenu && 'rotate-180', // 드롭다운 열림 시 화살표 회전
                  )}
                />
              </button>

              {/* 피드 타입 선택 드롭다운 */}
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
                          ? 'text-[var(--primary)] font-medium' // 선택된 상태
                          : 'text-[var(--grayscale-40)]', // 기본 상태
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
                          ? 'text-[var(--primary)] font-medium' // 선택된 상태
                          : 'text-[var(--grayscale-40)]', // 기본 상태
                      )}
                    >
                      취미 피드
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            /**
             * 기타 페이지 (게시글 작성, 마이페이지)
             * - 페이지 제목만 표시
             */
            <span className="text-lg font-semibold">
              {isPostWritePage
                ? '게시글 작성'
                : isMyPage
                  ? '마이페이지'
                  : '게시글'}
            </span>
          )}
        </div>

        {/* ===== 메뉴 버튼 (조건부 표시) ===== */}

        {/**
         * 전체 메뉴 버튼
         * - 게시글 상세, 작성, 마이페이지, 개인정보 수정 페이지에서는 숨김
         * - 피드 페이지에서만 표시 (로그아웃 등)
         */}
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

              {/* 메뉴 드롭다운 */}
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
