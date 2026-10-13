import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createLocalStoragePersist, stopOnHotReexecute } from "../../shared/lib";

type BookmarkType = "bookmark" | "notify";

interface BookmarkState {
  bookmarkEventMap: Map<string, BookmarkType>;
  toggleBookmarkEvent: (id: string) => void;
  toggleNotifyEvent: (id: string) => void;
  clearBookmarks: () => void;
}

const persisted = {
  bookmarkEventMap: new Map<string, BookmarkType>(),
};

const bookmarkPersist = createLocalStoragePersist(
  "bookmark",
  { bookmarkEventMap: "bookmarkEventMap" },
  persisted,
);

export const useBookmarkStore = create<BookmarkState>()(
  persist(
    (set, get) => ({
      ...persisted,

      // ブックマーク登録済みの場合はmapから削除
      toggleBookmarkEvent: (id) => {
        const bookmarkEventMap = new Map(get().bookmarkEventMap);
        if (bookmarkEventMap.has(id)) {
          bookmarkEventMap.delete(id);
        } else {
          bookmarkEventMap.set(id, "bookmark");
        }
        set({ bookmarkEventMap });
      },

      // 既に通知登録済みの場合は通知登録を解除してブックマークに変更
      toggleNotifyEvent: (id) => {
        const bookmarkEventMap = new Map(get().bookmarkEventMap);
        bookmarkEventMap.set(id, bookmarkEventMap.get(id) === "notify" ? "bookmark" : "notify");
        set({ bookmarkEventMap });
      },

      clearBookmarks: () => {
        set({ bookmarkEventMap: new Map() });
      },
    }),
    bookmarkPersist.options,
  ),
);

stopOnHotReexecute(
  import.meta.hot,
  "storageEvent",
  bookmarkPersist.rehydrateOnStorageEvent(useBookmarkStore),
);

export const selectHasBookmark = (id: string) => (state: BookmarkState) =>
  state.bookmarkEventMap.has(id);
export const selectHasNotify = (id: string) => (state: BookmarkState) =>
  state.bookmarkEventMap.get(id) === "notify";
