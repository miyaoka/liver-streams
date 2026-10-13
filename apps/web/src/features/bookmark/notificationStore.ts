import { create } from "zustand";

const isSupported = window && "Notification" in window;

interface NotificationState {
  isSupported: boolean;
  permissionGranted: boolean;
  ensurePermissions: () => Promise<boolean>;
}

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  isSupported,
  permissionGranted:
    isSupported && "permission" in Notification && Notification.permission === "granted",

  ensurePermissions: async () => {
    if (!isSupported) return false;
    if (get().permissionGranted) return true;

    // deniedの場合はrequestできないのでfalseを返す
    if (Notification.permission === "denied") return false;

    // request: ユーザーがアクションするかタイムアウトまで時間がかかる
    const permission = await Notification.requestPermission();
    const permissionGranted = permission === "granted";
    set({ permissionGranted });
    return permissionGranted;
  },
}));
