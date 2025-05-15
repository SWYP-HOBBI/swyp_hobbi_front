'use client';
import { useEffect, useState } from 'react';
import NotificationList from './notification_list';
import { notificationService } from '@/services/api';
import { Notification } from '@/types/notification';
import { connectNotificationSSE } from '@/services/sse';
import { useNotificationStore } from '@/store/notification';

export default function NotificationPage() {
  const [isDeleteVisible, setIsDeleteVisible] = useState(true); // 알림삭제 버튼 표시 여부
  const [selectedButton, setSelectedButton] = useState<string | null>(null); // '전체 읽음' 또는 '읽음'
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>(
    [],
  ); // 선택된 알림 ID들
  const [showCheckbox, setShowCheckbox] = useState(false); // 체크박스 표시 여부
  const [notifications, setNotifications] = useState<Notification[]>([]); //선택알림
  const { isNotificationOpen, closeNotification } = useNotificationStore();
  // const [noNotifications, setNoNotifications] = useState(false); // 알림이 없을 때 메시지 표시 여부

  // Body 스크롤 잠금
  useEffect(() => {
    if (isNotificationOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isNotificationOpen]);

  //  SSE 연결
  useEffect(() => {
    const eventSource = connectNotificationSSE((data: string) => {
      try {
        const newNotification = JSON.parse(data);
        setNotifications((prev) => [newNotification, ...prev]);
      } catch (error) {
        console.error('알림 파싱 오류:', error);
      }
    });

    return () => {
      eventSource.close(); // 컴포넌트 언마운트 시 종료
    };
  }, []);

  const handleButtonClick = (type: string) => {
    setSelectedButton(type);
  };

  const handleDeleteClick = () => {
    setIsDeleteVisible(false); //
    setShowCheckbox(true); // 체크박스를 보이게 설정
  };

  //선택 읽음 처리
  const handleMarkSelectedRead = async () => {
    try {
      if (selectedNotifications.length === 0) return;

      await notificationService.markSelectedRead(selectedNotifications);

      // 체크된 알림을 UI에서도 제거
      setNotifications((prev) =>
        prev.filter((n) => !selectedNotifications.includes(n.notificationId)),
      );

      // 상태 초기화
      setSelectedNotifications([]);
      setShowCheckbox(false);
      setIsDeleteVisible(true); // 버튼 원상 복구
    } catch (error) {
      console.error('선택 알림 읽음 처리 실패:', error);
    }
  };

  return (
    <div>
      <div className="fixed inset-0 bg-black/30" onClick={closeNotification} />
      <div className="bg-white border border-[var(--grayscale-20)] fixed top-0 left-[198px] z-50 w-[490px] h-full">
        <div className="flex justify-between p-4">
          <span className="text-[20px] font-semibold">알림</span>
          {isDeleteVisible ? (
            <span
              className="text-[14px] text-[var(--grayscale-80)] cursor-pointer"
              onClick={handleDeleteClick}
            >
              알림삭제
            </span>
          ) : (
            <div className="flex space-x-2 items-center">
              <button
                className={`w-[59px] h-[24px] rounded-[24px] text-[14px] border ${
                  selectedButton === '전체 읽음'
                    ? 'border-[var(--primary-b20)] bg-[var(--primary-w80)]'
                    : 'border-[var(--grayscale-20)]'
                }`}
                onClick={async () => {
                  handleButtonClick('전체 읽음');
                  try {
                    await notificationService.markAllRead(); // 전체 읽음 API
                    setNotifications([]); // 전체 제거
                    setShowCheckbox(false);
                    setIsDeleteVisible(true); // 버튼 복구
                  } catch (error) {
                    console.error('전체 읽음 처리 실패:', error);
                  }
                }}
              >
                전체 읽음
              </button>
              <button
                className={`w-[37px] h-[24px] rounded-[24px] text-[14px] border ${
                  selectedButton === '읽음'
                    ? 'border-[var(--primary-b20)] bg-[var(--primary-w80)]'
                    : 'border-[var(--grayscale-20)]'
                }`}
                onClick={() => {
                  handleButtonClick('읽음');
                  handleMarkSelectedRead(); // 선택 읽음 처리 실행
                }}
              >
                읽음
              </button>
            </div>
          )}
        </div>
        <NotificationList
          showCheckbox={showCheckbox}
          selectedNotifications={selectedNotifications}
          setSelectedNotifications={setSelectedNotifications}
          notifications={notifications}
          setNotifications={setNotifications}
        />
      </div>
    </div>
  );
}
