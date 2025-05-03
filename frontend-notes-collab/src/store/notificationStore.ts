import { create } from 'zustand';

type Notification = {
  id: string;
  message: string;
  author: string;
  createdAt: string;
};

type NotificationStore = {
  notifications: Notification[];
  setNotifications: (notifications: Notification[]) => void;
  removeNotification: (id: string) => void;
};

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  setNotifications: (notifications) => set({ notifications }),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));
