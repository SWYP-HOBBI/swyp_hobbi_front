'use client';
import SvgIcon from './svg_icon';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useModalStore } from '@/store/modal';
import { useSearchStore } from '@/store/search';
import { useState, useEffect } from 'react';
import { notificationService } from '@/services/api';
import { useNotificationStore } from '@/store/notification';
import { useFeedStore } from '@/store/feed';
import { useState, useEffect } from 'react';

export default function TabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { logout, isAuthenticated } = useAuthStore();
  const { openModal } = useModalStore();
  const { toggleSearch, isSearchOpen } = useSearchStore();
  const { toggleNotification, isNotificationOpen } = useNotificationStore();
  const [unreadCount, setUnreadCount] = useState(0); //알림 개수
  const { feedType, setFeedType } = useFeedStore();
  const [showNotification, setShowNotification] = useState(false);
  const [showFeedMenu, setShowFeedMenu] = useState(false);

  useEffect(() => {
    // 페이지가 변경될 때마다 피드 타입을 'all'로 초기화
    setFeedType('all');
  }, [pathname, setFeedType]);

  const handleProtectedRoute = (callback: () => void) => {
    if (!isAuthenticated) {
      openModal({
        title: '로그인이 필요합니다',
        message: '이 기능은 로그인 후 이용 가능합니다.',
        confirmText: '로그인 하기',
        onConfirm: () => router.push('/'),
      });
    } else {
      callback();
    }
  };

  const handleNotificationClick = () => {
    handleProtectedRoute(() => {
      toggleNotification();
    });
  };

  const isHome = pathname === '/posts';
  const isWrite = pathname === '/posts/write';
  const isMyPage = pathname === '/my_page';
  const isSearch = pathname === '/search';

  const iconColor = (active: boolean) =>
    active ? 'var(--primary)' : 'var(--grayscale-40)';
  const textColor = (active: boolean) =>
    active
      ? 'text-[var(--primary-b60)] font-semibold'
      : 'text-[var(--grayscale-40)]';

  //알림 개수 조회
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const { unreadCount } = await notificationService.getUnreadCount();
        setUnreadCount(unreadCount);
      } catch (error) {
        console.error('알림 수 조회 실패:', error);
      }
    };

    if (isAuthenticated) {
      fetchUnreadCount();
    }
  }, [isAuthenticated]);

  return (
    <div className="w-[198px] h-screen bg-white sticky top-0 flex flex-col">
      <div className="w-[198px] h-[112px] pt-[12px] pb-[5px] flex justify-center items-center">
        <SvgIcon name="logo" width={150} height={44} />
      </div>
      <div className="flex-1 flex flex-col justify-between">
        <div className="w-[198px] h-[412px] flex flex-col justify-between px-6 mt-[24px]">
          {/* 홈 */}
          <div className="relative">
            <div
              className={`w-[150px] flex items-center h-[52px] pt-[20px] ${
                isSearchOpen
                  ? 'opacity-30 pointer-events-none'
                  : 'cursor-pointer'
              }`}
            >
              <div
                className="flex items-center flex-1"
                onClick={() => router.push('/posts')}
              >
                <SvgIcon
                  name="home"
                  size={36}
                  color={isSearchOpen ? '#999999' : iconColor(isHome)}
                />
                <span
                  className={`ml-[24px] text-[16px] ${
                    isSearchOpen
                      ? 'text-[var(--grayscale-40)]'
                      : textColor(isHome)
                  }`}
                >
                  홈
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFeedMenu(!showFeedMenu);
                }}
                className={`ml-2 transform transition-transform duration-200 -rotate-90
                ${isSearchOpen ? 'opacity-30' : ''}`}
              >
                <SvgIcon name="arrow_down" size={24} />
              </button>
            </div>

            {/* 피드 선택 메뉴 */}
            {showFeedMenu && !isSearchOpen && (
              <div className="absolute left-[180px] top-[20px] bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50 min-w-[92px] text-sm">
                <button
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
                </button>
                <button
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
                </button>
              </div>
            )}
          </div>

          {/* 검색 */}
          <div
            className="w-[150px] flex items-center h-[52px] cursor-pointer"
            onClick={toggleSearch}
          >
            <SvgIcon
              name="search"
              size={36}
              color={isSearchOpen ? 'var(--primary)' : '#999999'}
            />
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
            className={`w-[150px] flex items-center h-[52px] ${
              isSearchOpen ? 'opacity-30 pointer-events-none' : 'cursor-pointer'
            }`}
            onClick={handleNotificationClick}
          >
            <SvgIcon
              name="alarm"
              size={36}
              color={
                isSearchOpen
                  ? '#999999'
                  : // : showNotification
                    isNotificationOpen
                    ? 'var(--primary)'
                    : '#999999'
              }
            />
            <span
              className={`ml-[24px] text-[16px] ${
                isSearchOpen
                  ? 'text-[var(--grayscale-40)]'
                  : // : showNotification
                    isNotificationOpen
                    ? 'text-[var(--primary-b60)] font-semibold'
                    : 'text-[var(--grayscale-40)]'
              }`}
            >
              알림
            </span>
            {/* 알림 표시 */}
            {unreadCount > 0 && (
              <div className="absolute right-0 top-[16px] w-[8px] h-[8px] bg-red-500 rounded-full" />
            )}
          </div>

          {/* 게시글 작성 (로그인 필요) */}
          <div
            className={`w-[150px] flex items-center h-[52px] ${
              isSearchOpen ? 'opacity-30 pointer-events-none' : 'cursor-pointer'
            }`}
            onClick={() =>
              handleProtectedRoute(() => router.push('/posts/write'))
            }
          >
            <SvgIcon
              name="write"
              size={36}
              color={isSearchOpen ? '#999999' : iconColor(isWrite)}
            />
            <span
              className={`ml-[24px] text-[16px] ${isSearchOpen ? 'text-[var(--grayscale-40)]' : textColor(isWrite)}`}
            >
              게시글 작성
            </span>
          </div>

          {/* 마이페이지 (로그인 필요) */}
          <div
            className={`w-[150px] flex items-center h-[52px] pb-[20px] ${
              isSearchOpen ? 'opacity-30 pointer-events-none' : 'cursor-pointer'
            }`}
            onClick={() => handleProtectedRoute(() => router.push('/my_page'))}
          >
            <SvgIcon
              name="my_page"
              size={36}
              color={isSearchOpen ? '#999999' : iconColor(isMyPage)}
            />
            <span
              className={`ml-[24px] text-[16px] ${isSearchOpen ? 'text-[var(--grayscale-40)]' : textColor(isMyPage)}`}
            >
              마이페이지
            </span>
          </div>
        </div>

        <div className="w-[198px] h-[64px] flex items-center justify-end text-[16px] text-right pr-6">
          <button
            className="text-[var(--grayscale-60)] cursor-pointer"
            onClick={() => logout()}
          >
            {isAuthenticated ? '로그아웃' : '로그인'}
          </button>
        </div>
      </div>
    </div>
  );
}
