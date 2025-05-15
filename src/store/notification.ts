import { create } from 'zustand';

interface NotificationStore {
  isNotificationOpen: boolean;
  unreadCount: number;
  toggleNotification: () => void;
  closeNotification: () => void;
  setUnreadCount: (count: number) => void;
  incrementUnreadCount: () => void;
  decrementUnreadCount: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  isNotificationOpen: false,
  unreadCount: 0,
  toggleNotification: () =>
    set((state) => ({ isNotificationOpen: !state.isNotificationOpen })),
  closeNotification: () => set({ isNotificationOpen: false }),
  setUnreadCount: (count: number) => set({ unreadCount: count }),
  incrementUnreadCount: () =>
    set((state) => ({ unreadCount: state.unreadCount + 1 })),
  decrementUnreadCount: () =>
    set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),
}));
