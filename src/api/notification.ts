import { Notification, NotificationDetailResponse } from '@/types/notification';
import { request } from './request';

export const notificationApi = {
  getNotifications: async (
    lastNotificationId?: number,
    pageSize: number = 15,
  ) => {
    const params = new URLSearchParams();
    if (lastNotificationId)
      params.append('lastNotificationId', lastNotificationId.toString());
    params.append('pageSize', pageSize.toString());
    return request<Notification[]>({
      url: `/notifications?${params}`,
      method: 'GET',
    });
  },
  getNotificationDetail: async (notificationId: number) => {
    return request<NotificationDetailResponse>({
      url: `/notifications/${notificationId}`,
      method: 'POST',
    });
  },
  markAllRead: async () => {
    return request<void>({
      url: '/notifications/read-all',
      method: 'POST',
    });
  },
  markSelectedRead: async (notificationIds: number[]) => {
    return request<void>({
      url: '/notifications/read',
      method: 'POST',
      data: { notificationIds },
    });
  },

  getUnreadCount: async () => {
    return request<{ unreadCount: number }>({
      url: '/notifications/unread-count',
      method: 'GET',
    });
  },
};
