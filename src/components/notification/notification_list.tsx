'use client';

import { useRef, useEffect, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import SvgIcon from '@/components/common/svg_icon';
import { notificationService } from '@/services/api';
import { Notification, NotificationListProps } from '@/types/notification';
import { formatDate } from '@/utils/date';
// import Loader from '@/components/common/loader';

export default function NotificationList({
  showCheckbox,
  selectedNotifications,
  setSelectedNotifications,
  notifications,
  setNotifications,
}: NotificationListProps) {
  const router = useRouter();
  const observerRef = useRef<HTMLDivElement | null>(null);
  const [isChecked, setIsChecked] = useState<boolean[]>([]);

  // 알림 데이터 가져오기
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery<Notification[], Error>({
      queryKey: ['notifications'],
      queryFn: async ({ pageParam }) => {
        const lastNotificationId = pageParam ? Number(pageParam) : undefined;
        return await notificationService.getNotifications(
          lastNotificationId,
          15,
        );
      },
      getNextPageParam: (lastPage) => {
        if (!lastPage || lastPage.length < 15) return undefined;
        return lastPage[lastPage.length - 1].notificationId;
      },
      initialPageParam: undefined,
      // onSuccess: (data) => {
      //   const all = data.pages.flat();
      //   setNotifications(all);
      //   setIsChecked(new Array(all.length).fill(false));
      // },
    });

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

  // 알림 상세 조회 & 삭제
  const handleClick = async (notification: Notification) => {
    try {
      const detail = await notificationService.getNotificationDetail(
        notification.notificationId,
      );
      // 게시글 ID 추출
      const postId = detail.targetPostId;
      router.push(`/post/${postId}`);
    } catch (error) {
      console.error('알림 상세 조회 실패:', error);
    }
  };

  // 체크박스 상태 변경
  const handleCheckboxChange = (index: number) => {
    const newCheckedState = [...isChecked];
    newCheckedState[index] = !newCheckedState[index];
    setIsChecked(newCheckedState);

    const selectedId = notifications[index].notificationId;

    if (newCheckedState[index]) {
      setSelectedNotifications([...selectedNotifications, selectedId]);
    } else {
      setSelectedNotifications(
        selectedNotifications.filter((id) => id !== selectedId),
      );
    }
  };

  // 체크박스 클릭 핸들러
  const handleCheckboxClick = (index: number, event: React.MouseEvent) => {
    event.stopPropagation();
    handleCheckboxChange(index);
  };

  if (status === 'error') {
    return <div>에러!</div>;
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-4 text-[14px] text-[var(--grayscale-60)]">
        알림이 없습니다.
      </div>
    );
  }

  return (
    <div className="px-4 space-y-4 overflow-y-auto h-full">
      {notifications.map((notification, index) => (
        <div
          key={notification.notificationId}
          className="w-[480px] h-[101px] flex flex-col cursor-pointer"
          onClick={() => handleClick(notification)}
        >
          <div className="w-[470px] h-[64px] mt-[12px] ml-[7px] flex items-center space-x-4">
            {/* 체크박스 */}
            {showCheckbox && (
              <button
                onClick={(e) => handleCheckboxClick(index, e)}
                className="ml-5"
              >
                <SvgIcon
                  name={isChecked[index] ? 'checkbox_on' : 'checkbox_off'}
                  className="w-6 h-6"
                />
              </button>
            )}

            {/* 알림별 아이콘 */}
            <SvgIcon
              name={
                notification.notificationType === 'COMMENT' ? 'chat' : 'heart'
              }
              size={36}
              color="var(--grayscale-40)"
              className="w-[64px] h-[64px] ml-[2px] rounded-full border border-[var(--grayscale-20)] flex items-center justify-center"
            />
            <div className="flex flex-col ml-[5px]">
              {/* 알림 메시지 */}
              <div className="text-[14px]">
                {notification.senderNickname}님이 회원님의 게시글에{' '}
                {notification.notificationType === 'COMMENT'
                  ? '댓글을 남겼습니다.'
                  : '좋아요를 남겼습니다.'}
              </div>

              {/* 댓글 내용 */}
              {notification.notificationType === 'COMMENT' && (
                <div className="text-[14px] max-w-[320px] overflow-hidden text-ellipsis whitespace-nowrap">
                  {notification.message}
                </div>
              )}
            </div>
          </div>
          <span className="flex justify-end text-[12px] mr-[5px] text-[var(--grayscale-40)]">
            {formatDate(notification.createdAt)}
          </span>
        </div>
      ))}

      {/* 무한스크롤 옵저버 감지 요소 */}
      <div ref={observerRef} className="h-4" />
      {isFetchingNextPage}
    </div>
  );
}
