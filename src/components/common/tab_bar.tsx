'use client';

import { motion } from 'framer-motion';
import SvgIcon from './svg_icon';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useModalStore } from '@/store/modal';
import { useSearchStore } from '@/store/search';
import { useEffect, useState } from 'react';
import { useNotificationStore } from '@/store/notification';
import { useFeedStore } from '@/store/feed';
import { notificationService } from '@/services/api';

export default function TabBar() {
  const unreadCount = useNotificationStore((state) => state.unreadCount);

  const router = useRouter();
  const pathname = usePathname();
  const { logout, isAuthenticated } = useAuthStore();
  const { openModal } = useModalStore();
  const { toggleSearch, isSearchOpen } = useSearchStore();
  const { toggleNotification, isNotificationOpen, setUnreadCount } =
    useNotificationStore();
  const { feedType, setFeedType } = useFeedStore();
  const [showFeedMenu, setShowFeedMenu] = useState(false);

  useEffect(() => {
    // 페이지가 변경될 때마다 피드 타입을 'all'로 초기화
    setFeedType('all');
  }, [pathname, setFeedType]);

  // 라우터 이동 시 검색/알림 닫기 함수
  const closeSearchAndNotification = () => {
    if (isSearchOpen) toggleSearch();
    if (isNotificationOpen) toggleNotification();
  };

  // 페이지 이동 함수
  const navigateToPage = (path: string) => {
    closeSearchAndNotification();
    router.push(path);
  };

  const handleProtectedRoute = (path: string) => {
    if (!isAuthenticated) {
      openModal({
        title: '로그인이 필요합니다',
        message: '로그인 후 이용해 주세요',
        confirmText: '로그인 하기',
        onConfirm: () => navigateToPage('/'),
      });
    } else {
      navigateToPage(path);
    }
  };

  const handleNotificationClick = () => {
    if (!isAuthenticated) {
      openModal({
        title: '로그인이 필요합니다',
        message: '로그인 후 이용해 주세요',
        confirmText: '로그인 하기',
        onConfirm: () => navigateToPage('/'),
      });
    } else {
      if (isSearchOpen) toggleSearch();
      toggleNotification();
    }
  };

  const handleSearchClick = () => {
    if (isNotificationOpen) toggleNotification();
    toggleSearch();
  };

  const handleLogout = () => {
    closeSearchAndNotification();
    logout();
    router.push('/');
  };

  const isHome = pathname === '/posts';
  const isWrite = pathname === '/posts/write';
  const isMyPage = pathname === '/my_page';

  const iconColor = (active: boolean) =>
    active ? 'var(--primary)' : 'var(--grayscale-40)';
  const textColor = (active: boolean) =>
    active
      ? 'text-[var(--primary-b60)] font-semibold'
      : 'text-[var(--grayscale-40)]';

  //알림 개수 조회
  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchUnreadCount = async () => {
      try {
        const response = await notificationService.getUnreadCount();
        setUnreadCount(Number(response));
      } catch (error) {
        console.error('알림 수 조회 실패:', error);
      }
    };
    fetchUnreadCount();
  }, [isAuthenticated, setUnreadCount]);

  // PC 버전 탭바
  const DesktopTabBar = () => (
    <div className="w-[240px] h-screen bg-grayscale-0 sticky top-0 hidden md:flex flex-col z-[9999]">
      <div className="w-[240px] h-[112px] pt-[12px] pb-[5px] flex justify-center items-center">
        <div
          className="flex justify-center items-center cursor-pointer"
          onClick={() => router.push('/posts')}
        >
          <SvgIcon name="logo" width={150} height={44} />
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-between">
        <div className="w-[240px] h-[412px] flex flex-col justify-between px-6 mt-6">
          {/* 홈 */}
          <div className="relative">
            <div className="w-full flex items-center h-[52px] cursor-pointer">
              <div
                className="flex items-center flex-1"
                onClick={() => navigateToPage('/posts')}
              >
                <SvgIcon name="home" size={36} color={iconColor(isHome)} />
                <span className={`ml-[24px] text-[16px] ${textColor(isHome)}`}>
                  홈
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFeedMenu(!showFeedMenu);
                }}
                className="ml-2 transform transition-transform duration-200 -rotate-90"
              >
                <SvgIcon name="arrow_down" size={24} />
              </button>
            </div>

            {/* 피드 선택 메뉴 */}
            {showFeedMenu && !isSearchOpen && (
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="absolute left-[222px] top-[20px] bg-grayscale-0 rounded-lg shadow-lg border border-gray-100  z-50 min-w-[120px] text-center text-sm"
              >
                <motion.button
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  onClick={() => {
                    setFeedType('all');
                    setShowFeedMenu(false);
                  }}
                  className={`w-full px-5 py-[10px] hover:bg-primary-w80 hover:text-primary-b80 rounded-t-lg  ${
                    feedType === 'all'
                      ? 'text-[var(--primary)] font-medium '
                      : 'text-[var(--grayscale-40)]'
                  }`}
                >
                  전체 피드
                </motion.button>
                <motion.button
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  onClick={() => {
                    setFeedType('hobby');
                    setShowFeedMenu(false);
                  }}
                  className={`w-full px-5 py-[10px] hover:bg-primary-w80 hover:text-primary-b80 rounded-b-lg  ${
                    feedType === 'hobby'
                      ? 'text-[var(--primary)] font-medium '
                      : 'text-[var(--grayscale-40)]'
                  }`}
                >
                  취미 피드
                </motion.button>
              </motion.div>
            )}
          </div>

          {/* 검색 */}
          <div
            className="w-full flex items-center h-[52px] cursor-pointer"
            onClick={handleSearchClick}
          >
            <SvgIcon name="search" size={36} color={iconColor(isSearchOpen)} />
            <span
              className={`ml-[24px] text-[16px] ${
                isSearchOpen
                  ? 'text-[var(--primary-b60)] font-semibold'
                  : 'text-[var(--grayscale-40)]'
              }`}
            >
              검색
            </span>
          </div>

          {/* 알림 (로그인 필요) */}
          <div
            onClick={handleNotificationClick}
            className="w-full flex items-center h-[52px] cursor-pointer"
          >
            <SvgIcon
              name="alarm"
              size={36}
              color={isNotificationOpen ? 'var(--primary)' : '#999999'}
            />
            <div className="flex items-center justify-between">
              <span
                className={`ml-[24px] text-[16px] ${
                  isNotificationOpen
                    ? 'text-[var(--primary-b60)] font-semibold'
                    : 'text-[var(--grayscale-40)]'
                }`}
              >
                알림
              </span>
              {unreadCount > 0 && (
                <div className="w-[8px] h-[8px] ml-22 bg-red-500 rounded-full" />
              )}
            </div>
          </div>

          {/* 게시글 작성 (로그인 필요) */}
          <div
            className="w-full flex items-center h-[52px] cursor-pointer"
            onClick={() => handleProtectedRoute('/posts/write')}
          >
            <SvgIcon name="write" size={36} color={iconColor(isWrite)} />
            <span className={`ml-[24px] text-[16px] ${textColor(isWrite)}`}>
              게시글 작성
            </span>
          </div>

          {/* 마이페이지 (로그인 필요) */}
          <div
            className="w-full flex items-center h-[52px] cursor-pointer"
            onClick={() => handleProtectedRoute('/my_page')}
          >
            <SvgIcon name="my_page" size={36} color={iconColor(isMyPage)} />
            <span className={`ml-[24px] text-[16px] ${textColor(isMyPage)}`}>
              마이페이지
            </span>
          </div>
        </div>

        <div className="w-full h-[64px] flex items-center justify-end text-[16px] text-right pr-6">
          <button
            className="text-[var(--grayscale-60)] cursor-pointer"
            onClick={() =>
              isAuthenticated ? handleLogout() : navigateToPage('/')
            }
          >
            {isAuthenticated ? '로그아웃' : '로그인'}
          </button>
        </div>
      </div>
    </div>
  );

  // 모바일 버전 탭바
  const MobileTabBar = () => (
    <div className="fixed bottom-0 left-0 w-full h-[72px] bg-grayscale-0 border-t border-[var(--grayscale-10)] md:hidden z-[9999]">
      <div className="flex justify-around items-center h-full px-4">
        {/* 홈 */}
        <button
          onClick={() => navigateToPage('/posts')}
          className="flex flex-col items-center space-y-1"
        >
          <SvgIcon name="home" size={24} color={iconColor(isHome)} />
          <span className={`text-[10px] ${textColor(isHome)}`}>홈</span>
        </button>

        {/* 검색 */}
        <button
          onClick={handleSearchClick}
          className="flex flex-col items-center space-y-1"
        >
          <SvgIcon name="search" size={24} color={iconColor(isSearchOpen)} />
          <span className={`text-[10px] ${textColor(isSearchOpen)}`}>검색</span>
        </button>

        {/* 알림 */}
        <button
          onClick={handleNotificationClick}
          className="flex flex-col items-center space-y-1"
        >
          <div className="flex flex-row items-center relative">
            <SvgIcon
              name="alarm"
              size={24}
              color={iconColor(isNotificationOpen)}
            />
            {unreadCount > 0 && (
              <div className="ml-1 w-[8px] h-[8px] bg-red-500 rounded-full absolute top-0 right-0" />
            )}
          </div>
          <span className={`text-[10px] ${textColor(isNotificationOpen)}`}>
            알림
          </span>
        </button>

        {/* 게시글 작성 */}
        <button
          onClick={() => handleProtectedRoute('/posts/write')}
          className="flex flex-col items-center space-y-1"
        >
          <SvgIcon name="write" size={24} color={iconColor(isWrite)} />
          <span className={`text-[10px] ${textColor(isWrite)}`}>글쓰기</span>
        </button>

        {/* 마이페이지 */}
        <button
          onClick={() => handleProtectedRoute('/my_page')}
          className="flex flex-col items-center space-y-1"
        >
          <SvgIcon name="my_page" size={24} color={iconColor(isMyPage)} />
          <span className={`text-[10px] ${textColor(isMyPage)}`}>마이</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <DesktopTabBar />
      <MobileTabBar />
    </>
  );
}
