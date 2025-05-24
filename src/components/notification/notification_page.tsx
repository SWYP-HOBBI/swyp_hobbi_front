'use client';
import { useEffect, useState } from 'react';
import NotificationList from './notification_list';
import { notificationService } from '@/services/api';
import { Notification } from '@/types/notification';
import { useNotificationStore } from '@/store/notification';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotificationPage() {
  const [isDeleteVisible, setIsDeleteVisible] = useState(true); // 알림삭제 버튼 표시 여부
  const [selectedButton, setSelectedButton] = useState<string | null>(null); // '전체 읽음' 또는 '읽음'
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>(
    [],
  ); // 선택된 알림 ID들
  const [showCheckbox, setShowCheckbox] = useState(false); // 체크박스 표시 여부
  const [notifications, setNotifications] = useState<Notification[]>([]); //선택알림
  const { isNotificationOpen, closeNotification } = useNotificationStore();
  const [isChecked, setIsChecked] = useState<boolean[]>([]);

  const queryClient = useQueryClient();

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
      queryClient.setQueryData(['notifications'], (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page: Notification[]) =>
            page.filter(
              (n) => !selectedNotifications.includes(n.notificationId),
            ),
          ),
        };
      });

      // 상태 초기화
      setSelectedNotifications([]);
      setShowCheckbox(false);
      setSelectedButton(null);
      setIsDeleteVisible(true); // 버튼 원상 복구
    } catch (error) {
      console.error('선택 알림 읽음 처리 실패:', error);
    }
  };

  return (
    <AnimatePresence>
      {isNotificationOpen && (
        <motion.div
          key="notification-panel-wrapper"
          className="fixed top-0 max-md:left-0 left-[198px] z-50 w-full h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* 어두운 배경 */}
          <motion.div
            className="fixed inset-0 bg-grayscale-100/30"
            onClick={closeNotification}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* 알림 사이드 패널 */}
          <motion.div
            key="notification-panel"
            initial={{ x: -490 }}
            animate={{ x: 0 }}
            exit={{ x: -490 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative top-0 w-[490px] max-md:w-full bg-[var(--grayscale-1)] shadow-lg h-screen overflow-y-auto z-50"
          >
            <div className="flex justify-between p-4">
              <span className="text-xl font-semibold">알림</span>
              {isDeleteVisible ? (
                <span
                  className="text-sm text-[var(--grayscale-80)] cursor-pointer mt-2"
                  onClick={handleDeleteClick}
                >
                  알림삭제
                </span>
              ) : (
                <div className="flex space-x-2 items-center mt-2">
                  <button
                    className={`px-2 py-1 rounded-[24px] text-sm border ${
                      selectedButton === '전체 읽음'
                        ? 'border-[var(--primary-b20)] bg-[var(--primary-w80)]'
                        : 'border-[var(--grayscale-20)]'
                    }`}
                    onClick={async () => {
                      handleButtonClick('전체 읽음');
                      try {
                        await notificationService.markAllRead(); // 전체 읽음 API
                        queryClient.setQueryData(
                          ['notifications'],
                          (oldData: any) => {
                            if (!oldData) return oldData;
                            return {
                              ...oldData,
                              pages: oldData.pages.map(() => []),
                            };
                          },
                        );
                        setShowCheckbox(false);
                        setIsDeleteVisible(true);
                        setSelectedButton(null);
                      } catch (error) {
                        console.error('전체 읽음 처리 실패:', error);
                      }
                    }}
                  >
                    전체 읽음
                  </button>
                  <button
                    className={`px-2 py-1 rounded-[24px] text-sm border ${
                      selectedButton === '읽음'
                        ? 'border-[var(--primary-b20)] bg-[var(--primary-w80)]'
                        : 'border-[var(--grayscale-20)]'
                    }`}
                    onClick={() => {
                      handleButtonClick('읽음');
                      handleMarkSelectedRead();
                    }}
                    disabled={selectedNotifications.length === 0}
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
              isChecked={isChecked}
              setIsChecked={setIsChecked}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
