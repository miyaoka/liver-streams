import { useLocalStorage } from "@vueuse/core";
import { defineStore } from "pinia";

type BookmarkType = "bookmark" | "notify";

export const useBookmarkStore = defineStore("bookmarkStore", () => {
  const bookmarkEventMap = useLocalStorage("bookmarkEventMap", new Map<string, BookmarkType>());

  // ブックマーク登録済みの場合はmapから削除
  function toggleBookmarkEvent(id: string) {
    if (bookmarkEventMap.value.has(id)) {
      bookmarkEventMap.value.delete(id);
    } else {
      bookmarkEventMap.value.set(id, "bookmark");
    }
  }

  // 既に通知登録済みの場合は通知登録を解除してブックマークに変更
  function toggleNotifyEvent(id: string) {
    if (bookmarkEventMap.value.get(id) === "notify") {
      bookmarkEventMap.value.set(id, "bookmark");
    } else {
      bookmarkEventMap.value.set(id, "notify");
    }
  }

  function hasBookmark(id: string) {
    return bookmarkEventMap.value.has(id);
  }
  function hasNotify(id: string) {
    return bookmarkEventMap.value.get(id) === "notify";
  }
  return {
    bookmarkEventMap,
    toggleBookmarkEvent,
    toggleNotifyEvent,
    hasBookmark,
    hasNotify,
  };
});
