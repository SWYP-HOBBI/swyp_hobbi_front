'use client';

import { useRef, useEffect } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import SvgIcon from '@/components/common/svg_icon';
import { notificationService } from '@/services/api';
import { Notification, NotificationListProps } from '@/types/notification';
import { formatDate } from '@/utils/date';
import { useNotificationStore } from '@/store/notification';
import GlobalError from '@/app/global-error';

export default function NotificationList({
  showCheckbox,
  selectedNotifications,
  setSelectedNotifications,
  isChecked,
  setIsChecked,
}: NotificationListProps) {
  const router = useRouter();
  const observerRef = useRef<HTMLDivElement | null>(null);
  const { decrementUnreadCount } = useNotificationStore();

  // 알림 데이터 가져오기
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    error,
    refetch,
  } = useInfiniteQuery<Notification[], Error>({
    queryKey: ['notifications'],
    queryFn: async ({ pageParam }) => {
      const lastNotificationId = pageParam ? Number(pageParam) : undefined;
      return await notificationService.getNotifications(lastNotificationId, 15);
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.length < 15) return undefined;
      return lastPage[lastPage.length - 1].notificationId;
    },
    initialPageParam: undefined,
    // 실시간 업데이트를 위한 설정 추가
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  // 무한 스크롤 설정
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    if (observerRef.current) observer.observe(observerRef.current);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    if (data) {
      const allNotifications = data.pages.flat();
      setIsChecked(new Array(allNotifications.length).fill(false));
    }
  }, [data, setIsChecked]);

  // 알림 상세 조회 & 이동
  const handleClick = async (notification: Notification) => {
    try {
      const detail = await notificationService.getNotificationDetail(
        notification.notificationId,
      );

      // 읽지 않은 알림을 읽었을 때만 카운트 감소
      if (!notification.read) {
        decrementUnreadCount();
      }

      router.push(`/posts/${detail.targetPostId}`);
    } catch (error) {
      console.error('알림 상세 조회 실패:', error);
    }
  };

  // 체크박스 상태 변경
  const handleCheckboxChange = (index: number, notificationId: number) => {
    const newCheckedState = [...isChecked];
    newCheckedState[index] = !newCheckedState[index];

    // 상태 변경 시 부모 컴포넌트의 상태도 업데이트
    setIsChecked(newCheckedState);

    if (newCheckedState[index]) {
      setSelectedNotifications([...selectedNotifications, notificationId]);
    } else {
      setSelectedNotifications(
        selectedNotifications.filter((id) => id !== notificationId),
      );
    }
  };

  if (status === 'error') return <GlobalError error={error} reset={refetch} />;

  if (!data || data.pages[0].length === 0) {
    return (
      <div className="text-center py-4 text-sm text-[var(--grayscale-60)]">
        알림이 없습니다.
      </div>
    );
  }

  return (
    <div className="px-4 space-y-4 overflow-y-auto h-full">
      {data.pages.map((page) =>
        page.map((notification, index) => (
          <div
            key={notification.notificationId}
            className="w-full h-[101px] flex flex-col cursor-pointer"
            onClick={() => handleClick(notification)}
          >
            <div className="w-full h-[64px] mt-[12px] ml-[7px] flex items-center space-x-4">
              {showCheckbox && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCheckboxChange(index, notification.notificationId);
                  }}
                  className="ml-1"
                >
                  <SvgIcon
                    name={isChecked[index] ? 'checkbox_on' : 'checkbox_off'}
                    className="w-6 h-6"
                    color={
                      isChecked[index]
                        ? 'var(--primary)'
                        : 'var(--grayscale-40)'
                    }
                  />
                </button>
              )}

              <SvgIcon
                name={
                  notification.notificationType === 'COMMENT' ? 'chat' : 'heart'
                }
                size={36}
                color="var(--grayscale-40)"
                className="w-[64px] h-[64px] ml-[2px] rounded-full border border-[var(--grayscale-20)] flex items-center justify-center"
              />
              <div className="flex flex-col ml-[5px]">
                <div className="text-sm">
                  {notification.senderNickname}님이 회원님의 게시글에{' '}
                  {notification.notificationType === 'COMMENT'
                    ? '댓글을 남겼습니다.'
                    : '좋아요를 남겼습니다.'}
                </div>

                {notification.notificationType === 'COMMENT' && (
                  <div className="text-sm max-w-[320px] overflow-hidden text-ellipsis whitespace-nowrap">
                    {notification.message}
                  </div>
                )}
              </div>
            </div>
            <span className="flex justify-end text-xs mr-[20px] text-[var(--grayscale-40)]">
              {formatDate(notification.createdAt)}
            </span>
          </div>
        )),
      )}

      <div ref={observerRef} className="h-20" />
      {isFetchingNextPage && (
        <div className="text-center">알림 불러오는 중...</div>
      )}
    </div>
  );
}
