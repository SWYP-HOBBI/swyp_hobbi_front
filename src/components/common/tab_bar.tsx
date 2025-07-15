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
import clsx from 'clsx';

/**
 * 하단/사이드 TabBar(네비게이션) 컴포넌트
 *
 * 주요 기능:
 * - PC/모바일 반응형 지원
 * - 알림, 검색, 피드, 마이페이지 등 주요 경로 이동
 * - 상태/스토어 연동
 * - 인증 상태에 따른 접근 제어
 *
 * 리팩토링 개선사항:
 * - 공통 로직 추출 (탭 아이템 정의, 이벤트 핸들러)
 * - 재사용 가능한 컴포넌트 분리
 * - 타입 안전성 강화
 * - 코드 중복 제거
 */

// ===== 타입 정의 =====

/**
 * 탭 아이템 타입 정의
 */
interface TabItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  requiresAuth: boolean;
  mobileLabel?: string; // 모바일에서 다른 라벨 사용 시
}

/**
 * 탭 아이템 렌더링 props 타입
 */
interface TabItemProps {
  item: TabItem;
  isActive: boolean;
  onClick: () => void;
  iconSize: number;
  showLabel: boolean;
  className?: string;
}

// ===== 상수 정의 =====

/**
 * 탭 아이템 정의
 *
 * 모든 탭의 정보를 중앙에서 관리하여 일관성과 유지보수성을 향상시킵니다.
 */
const TAB_ITEMS: TabItem[] = [
  {
    id: 'home',
    label: '홈',
    path: '/posts',
    icon: 'home',
    requiresAuth: false,
  },
  {
    id: 'search',
    label: '검색',
    path: '/search',
    icon: 'search',
    requiresAuth: false,
  },
  {
    id: 'notification',
    label: '알림',
    path: '/notification',
    icon: 'alarm',
    requiresAuth: true,
  },
  {
    id: 'write',
    label: '게시글 작성',
    path: '/posts/write',
    icon: 'write',
    requiresAuth: true,
  },
  {
    id: 'myPage',
    label: '마이페이지',
    path: '/my_page',
    icon: 'my_page',
    requiresAuth: true,
    mobileLabel: '마이',
  },
];

// ===== 공통 유틸리티 함수들 =====

/**
 * 아이콘 색상 반환 함수
 */
const getIconColor = (active: boolean) =>
  active ? 'var(--primary)' : 'var(--grayscale-40)';

/**
 * 텍스트 색상 반환 함수
 */
const getTextColor = (active: boolean, className = 'text-[16px]') =>
  clsx(
    className,
    active
      ? 'text-[var(--primary-b60)] font-semibold'
      : 'text-[var(--grayscale-40)]',
  );

// ===== 재사용 가능한 컴포넌트들 =====
// (TabItemComponent, NotificationBadge, 관련 타입, 주석 전체 삭제)

/**
 * 피드 선택 메뉴 컴포넌트
 */
const FeedMenu = ({
  isVisible,
  feedType,
  onFeedTypeChange,
  onClose,
}: {
  isVisible: boolean;
  feedType: string;
  onFeedTypeChange: (type: 'all' | 'hobby') => void;
  onClose: () => void;
}) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -20, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="absolute left-[222px] top-[10px] bg-grayscale-0 rounded-lg shadow-lg border border-gray-100 z-50 min-w-[120px] text-center text-sm"
    >
      {[
        { value: 'all', label: '전체 피드' },
        { value: 'hobby', label: '취미 피드' },
      ].map((option, index) => (
        <motion.button
          key={option.value}
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 * (index + 1) }}
          onClick={() => {
            onFeedTypeChange(option.value as 'all' | 'hobby');
            onClose();
          }}
          className={clsx(
            'w-full px-5 py-[10px] hover:bg-primary-w80 hover:text-primary-b80',
            index === 0 ? 'rounded-t-lg' : 'rounded-b-lg',
            feedType === option.value
              ? 'text-[var(--primary)] font-medium'
              : 'text-[var(--grayscale-40)]',
          )}
        >
          {option.label}
        </motion.button>
      ))}
    </motion.div>
  );
};

// PC용 탭 아이템 컴포넌트
const DesktopTabItem = ({
  item,
  isActive,
  onClick,
  iconSize,
  showLabel,
  unreadCount,
}: TabItemProps & { unreadCount?: number }) => {
  const label = item.label;
  // 알림 탭이면 오른쪽 끝에 뱃지
  if (item.id === 'notification') {
    return (
      <div
        className="flex items-center justify-between w-full cursor-pointer h-full"
        onClick={onClick}
      >
        <div className="flex items-center">
          <SvgIcon
            name={item.icon as any}
            size={iconSize}
            color={getIconColor(isActive)}
          />
          {showLabel && (
            <span className={clsx('ml-[24px]', getTextColor(isActive))}>
              {label}
            </span>
          )}
        </div>
        {typeof unreadCount === 'number' && unreadCount > 0 && (
          <div className="w-[12px] h-[12px] bg-[#F51B50] rounded-full ml-4" />
        )}
      </div>
    );
  }
  // 일반 탭
  return (
    <div
      className={`flex items-center cursor-pointer h-full`}
      onClick={onClick}
    >
      <SvgIcon
        name={item.icon as any}
        size={iconSize}
        color={getIconColor(isActive)}
      />
      {showLabel && (
        <span className={clsx('ml-[24px]', getTextColor(isActive))}>
          {label}
        </span>
      )}
    </div>
  );
};

// 모바일용 탭 아이템 컴포넌트
const MobileTabItem = ({
  item,
  isActive,
  onClick,
  iconSize,
  showLabel,
  unreadCount,
}: TabItemProps & { unreadCount?: number }) => {
  const label = showLabel ? item.mobileLabel || item.label : item.label;
  return (
    <div
      className="flex flex-col items-center space-y-1 cursor-pointer"
      onClick={onClick}
    >
      <div className="relative flex items-center">
        <SvgIcon
          name={item.icon as any}
          size={iconSize}
          color={getIconColor(isActive)}
        />
        {/* 모바일: 알림 탭이면 아이콘 오른쪽 위에 뱃지 */}
        {item.id === 'notification' &&
          typeof unreadCount === 'number' &&
          unreadCount > 0 && (
            <div className="w-[6px] h-[6px] bg-[#F51B50] rounded-full absolute -top-1 -right-1" />
          )}
      </div>
      {showLabel && (
        <span
          className={clsx('text-[10px]', getTextColor(isActive, 'text-[10px]'))}
        >
          {label}
        </span>
      )}
    </div>
  );
};

// ===== 메인 컴포넌트 =====

export default function TabBar() {
  // ===== 상태 및 스토어 =====
  /**
   * 라우팅 및 상태 관리 훅
   * - router: Next.js 라우터 인스턴스 (페이지 이동)
   * - pathname: 현재 경로 (활성 탭 판단)
   * - logout, isAuthenticated: 인증 상태 및 로그아웃 함수 (Zustand)
   * - openModal: 인증 필요시 모달 오픈 (Zustand)
   * - toggleSearch, isSearchOpen: 검색창 상태/토글 (Zustand)
   * - toggleNotification, isNotificationOpen, setUnreadCount, unreadCount: 알림창 상태/토글/미확인 개수 (Zustand)
   * - feedType, setFeedType: 피드 타입(전체/취미) 상태/변경 (Zustand)
   * - showFeedMenu: PC에서 피드 메뉴 드롭다운 표시 여부 (로컬 상태)
   */
  const router = useRouter();
  const pathname = usePathname();
  const { logout, isAuthenticated } = useAuthStore();
  const { openModal } = useModalStore();
  const { toggleSearch, isSearchOpen } = useSearchStore();
  const {
    toggleNotification,
    isNotificationOpen,
    setUnreadCount,
    unreadCount,
  } = useNotificationStore();
  const { feedType, setFeedType } = useFeedStore();
  const [showFeedMenu, setShowFeedMenu] = useState(false);

  // ===== 이벤트 핸들러들 =====

  /**
   * 페이지 이동 시 공통 처리
   * - 검색/알림창 닫기
   * - 피드 메뉴 닫기
   * - 라우터로 경로 이동
   */
  const handlePageNavigation = (path: string) => {
    if (isSearchOpen) toggleSearch();
    if (isNotificationOpen) toggleNotification();
    setShowFeedMenu(false);
    router.push(path);
  };

  /**
   * 인증이 필요한 경로 접근 시 처리
   * - 미인증: 모달 안내 후 홈으로 이동
   * - 인증: 정상 이동
   */
  const handleProtectedRoute = (path: string) => {
    if (!isAuthenticated) {
      openModal({
        title: '로그인이 필요합니다',
        message: '로그인 후 이용해 주세요',
        confirmText: '로그인 하기',
        onConfirm: () => handlePageNavigation('/'),
      });
    } else {
      handlePageNavigation(path);
    }
  };

  /**
   * 탭 클릭 핸들러 (탭별 분기)
   * - 홈: 이동
   * - 검색: 알림창 닫고 검색창 토글
   * - 알림: 인증 필요시 모달, 아니면 검색창 닫고 알림창 토글
   * - 글쓰기/마이페이지: 인증 필요시 모달, 아니면 이동
   * - 기타: 이동
   */
  const handleTabClick = (item: TabItem) => {
    switch (item.id) {
      case 'home':
        handlePageNavigation(item.path);
        break;
      case 'search':
        if (isNotificationOpen) toggleNotification();
        toggleSearch();
        break;
      case 'notification':
        if (!isAuthenticated) {
          openModal({
            title: '로그인이 필요합니다',
            message: '로그인 후 이용해 주세요',
            confirmText: '로그인 하기',
            onConfirm: () => handlePageNavigation('/'),
          });
        } else {
          if (isSearchOpen) toggleSearch();
          toggleNotification();
        }
        break;
      case 'write':
      case 'myPage':
        handleProtectedRoute(item.path);
        break;
      default:
        handlePageNavigation(item.path);
    }
  };

  /**
   * 로그아웃 처리
   * - 검색/알림창/피드 메뉴 닫기
   * - 로그아웃 후 홈으로 이동
   */
  const handleLogout = () => {
    if (isSearchOpen) toggleSearch();
    if (isNotificationOpen) toggleNotification();
    setShowFeedMenu(false);
    logout();
    router.push('/');
  };

  // ===== 사이드 이펙트 =====

  /**
   * 페이지 변경 시 피드 타입을 항상 'all'로 초기화 (PC 피드 메뉴 UX)
   */
  useEffect(() => {
    setFeedType('all');
  }, [pathname, setFeedType]);

  /**
   * 로그인 상태일 때 알림 미확인 개수 조회 (React Query/서비스 연동)
   * - 실패 시 콘솔 에러
   */
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

  // ===== 현재 경로에 따른 활성 탭 계산 =====
  const isHome = pathname === '/posts';
  const isWrite = pathname === '/posts/write';
  const isMyPage = pathname === '/my_page';

  // ===== PC 버전 탭바 =====
  /**
   * - 좌측 고정 사이드바 (md 이상에서만 노출)
   * - 로고, 탭 목록, 로그인/로그아웃 버튼, 피드 메뉴(드롭다운)
   * - 알림 뱃지는 알림 탭 오른쪽 끝에 위치
   * - 피드 메뉴는 홈 탭에서만 노출
   */
  const DesktopTabBar = () => (
    <div className="w-[240px] h-screen bg-grayscale-0 sticky top-0 hidden md:flex flex-col z-[9999]">
      {/* 로고 영역 */}
      <div className="w-[240px] h-[112px] pt-[12px] pb-[5px] flex justify-center items-center">
        <div
          className="flex justify-center items-center cursor-pointer"
          onClick={() => router.push('/posts')}
        >
          <SvgIcon name="logo" width={150} height={44} />
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-between">
        {/* 탭 아이템들 */}
        <div className="w-[240px] h-[412px] flex flex-col justify-between px-6 mt-6">
          {TAB_ITEMS.map((item) => (
            <div key={item.id} className="relative w-full h-[52px]">
              {item.id === 'home' ? (
                // 홈 탭 (피드 메뉴 포함)
                <>
                  <div className="w-full flex items-center h-[52px] cursor-pointer">
                    <div
                      className="flex items-center flex-1"
                      onClick={() => handleTabClick(item)}
                    >
                      <DesktopTabItem
                        item={item}
                        isActive={isHome}
                        onClick={() => handleTabClick(item)}
                        iconSize={36}
                        showLabel={true}
                        unreadCount={unreadCount}
                      />
                    </div>
                    {/* 피드 메뉴 드롭다운 버튼 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowFeedMenu(!showFeedMenu);
                      }}
                      className="ml-2 transform transition-transform duration-200 -rotate-90"
                      aria-label="피드 메뉴 열기"
                    >
                      <SvgIcon name="arrow_down" size={24} />
                    </button>
                  </div>
                  {/* 피드 메뉴 드롭다운 (홈 탭에서만 노출) */}
                  <FeedMenu
                    isVisible={showFeedMenu && !isSearchOpen}
                    feedType={feedType}
                    onFeedTypeChange={setFeedType}
                    onClose={() => setShowFeedMenu(false)}
                  />
                </>
              ) : (
                // 일반 탭
                <DesktopTabItem
                  item={item}
                  isActive={
                    item.id === 'search'
                      ? isSearchOpen
                      : item.id === 'notification'
                        ? isNotificationOpen
                        : item.id === 'write'
                          ? isWrite
                          : item.id === 'myPage'
                            ? isMyPage
                            : false
                  }
                  onClick={() => handleTabClick(item)}
                  iconSize={36}
                  showLabel={true}
                  unreadCount={
                    item.id === 'notification' ? unreadCount : undefined
                  }
                />
              )}
            </div>
          ))}
        </div>
        {/* 로그인/로그아웃 버튼 */}
        <div className="w-full h-[64px] flex items-center justify-end text-[16px] text-right pr-6">
          <button
            className="text-[var(--grayscale-60)] cursor-pointer"
            onClick={() =>
              isAuthenticated ? handleLogout() : handlePageNavigation('/')
            }
          >
            {isAuthenticated ? '로그아웃' : '로그인'}
          </button>
        </div>
      </div>
      {/* FeedMenu는 더 이상 DesktopTabBar 바깥에 있지 않음 */}
    </div>
  );

  // ===== 모바일 버전 탭바 =====
  /**
   * - 하단 고정 네비게이션 바 (md 미만에서만 노출)
   * - 각 탭은 아이콘+텍스트 세로 배치
   * - 알림 뱃지는 아이콘 오른쪽 위에 겹쳐서 표시
   */
  const MobileTabBar = () => (
    <div className="fixed bottom-0 left-0 w-full h-[72px] bg-grayscale-0 border-t border-[var(--grayscale-10)] md:hidden z-[9999]">
      <div className="flex justify-around items-center h-full px-4">
        {TAB_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => handleTabClick(item)}
            className="flex flex-col items-center space-y-1"
          >
            <MobileTabItem
              item={item}
              isActive={
                item.id === 'home'
                  ? isHome
                  : item.id === 'search'
                    ? isSearchOpen
                    : item.id === 'notification'
                      ? isNotificationOpen
                      : item.id === 'write'
                        ? isWrite
                        : item.id === 'myPage'
                          ? isMyPage
                          : false
              }
              onClick={() => handleTabClick(item)}
              iconSize={24}
              showLabel={true}
              unreadCount={item.id === 'notification' ? unreadCount : undefined}
            />
          </button>
        ))}
      </div>
    </div>
  );

  // ===== 렌더링 =====
  /**
   * - PC(데스크톱): DesktopTabBar
   * - 모바일: MobileTabBar
   * - 두 버전 모두 동시에 렌더링, CSS로 반응형 분기
   */
  return (
    <>
      <DesktopTabBar />
      <MobileTabBar />
    </>
  );
}
