import { defineStore } from "pinia";
import { ref } from "vue";

const isSupported = window && "Notification" in window;

export const useNotificationStore = defineStore("notificationStore", () => {
  const permissionGranted = ref(
    isSupported && "permission" in Notification && Notification.permission === "granted",
  );

  async function ensurePermissions() {
    if (!isSupported) return false;
    if (permissionGranted.value) return true;

    // deniedの場合はrequestできないのでfalseを返す
    if (Notification.permission === "denied") return false;

    // request: ユーザーがアクションするかタイムアウトまで時間がかかる
    const permission = await Notification.requestPermission();
    permissionGranted.value = permission === "granted";
    return permissionGranted.value;
  }

  return {
    isSupported,
    permissionGranted,
    ensurePermissions,
  };
});
