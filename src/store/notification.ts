import { create } from 'zustand';

interface NotificationState {
  isNotificationOpen: boolean;
  toggleNotification: () => void;
  openNotification: () => void;
  closeNotification: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  isNotificationOpen: false,
  toggleNotification: () =>
    set((state) => ({ isNotificationOpen: !state.isNotificationOpen })),
  openNotification: () => set({ isNotificationOpen: true }),
  closeNotification: () => set({ isNotificationOpen: false }),
}));
