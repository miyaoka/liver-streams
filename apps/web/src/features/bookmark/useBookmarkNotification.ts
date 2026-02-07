import type { LiverEvent } from "@liver-streams/core";
import { hhmmDateFormatter } from "@liver-streams/core";
import { useBookmarkStore } from "./bookmarkStore";

export function processBookmarkNotification(liverEventMap: Map<string, LiverEvent>) {
  const bookmarkStore = useBookmarkStore();
  const now = Date.now();

  bookmarkStore.bookmarkEventMap.forEach((bookmarkType, id) => {
    const bookmarkEvent = liverEventMap.get(id);
    // liverEventListに存在しないbookmarkを削除
    if (!bookmarkEvent) {
      bookmarkStore.bookmarkEventMap.delete(id);
      return;
    }

    // 通常のbookmarkはスキップ
    if (bookmarkType !== "notify") return;
    // 開始時間になっていなければスキップ
    if (now < bookmarkEvent.startAt.getTime()) return;
    // 通知許可がある場合に通知
    if (Notification.permission === "granted") {
      const hhmm = hhmmDateFormatter.format(bookmarkEvent.startAt);
      // 通知する
      const notification = new Notification(`${hhmm} ${bookmarkEvent.talent.name}`, {
        body: bookmarkEvent.title,
        icon: bookmarkEvent.thumbnail,
      });
      notification.onclick = () => {
        window.open(bookmarkEvent.url);
      };
    }
    // 通知後はnotifyからbookmarkに変更
    bookmarkStore.bookmarkEventMap.set(id, "bookmark");
  });
}
