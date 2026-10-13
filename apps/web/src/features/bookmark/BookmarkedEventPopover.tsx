/**
 * ブックマーク一覧のポップオーバー UI。ブックマークしたイベントを時系列で表示する。
 *
 * クリックで対象イベントのカードにスクロールし、詳細ポップオーバーを開く。一括クリア機能あり。
 */
import type { LiverEvent } from "@liver-streams/core";
import {
  getThumbnail,
  compareDate,
  getDateTime,
  hhmmDateFormatter,
  toRelativeTime,
} from "@liver-streams/core";
import { useEffectEvent, useLayoutEffect } from "react";
import { scrollToLiverEventTop } from "../../shared/lib";
import { selectCurrentDateTime, useDateStore, useHoverStore } from "../../shared/stores";
import { closePopover } from "../../shared/utils";
import { useBookmarkStore } from "./";

type Props = {
  bookmarkEventList: LiverEvent[];
};

export default function BookmarkedEventPopover({ bookmarkEventList }: Props) {
  const currentDateTime = useDateStore(selectCurrentDateTime);
  const hoverEvent = useHoverStore((state) => state.hoverEvent);
  const unhoverEvent = useHoverStore((state) => state.unhoverEvent);
  const clearBookmarks = useBookmarkStore((state) => state.clearBookmarks);

  const bookmarkCount = bookmarkEventList.length;

  function getEventTime(liverEvent: LiverEvent) {
    const startAt = liverEvent.startAt;
    const startDateTime = getDateTime(startAt);

    const dateDiff = compareDate({
      baseDateTime: currentDateTime,
      targetDateTime: startDateTime,
    });

    // 今日なら時刻を返す
    if (dateDiff === 0) {
      return hhmmDateFormatter.format(startAt);
    }

    // 別の日なら相対時刻を返す
    return toRelativeTime(startDateTime - currentDateTime);
  }

  // マウント時の一覧だけを見る
  const scrollToNextEvent = useEffectEvent(() => {
    const now = Date.now();
    // 現在より後で最も近いイベントにスクロールする
    const nextEvent =
      bookmarkEventList.find((event) => event.startAt.getTime() > now) ?? bookmarkEventList.at(-1);
    if (!nextEvent) return;

    const targetEl = document.querySelector(`[data-fav-event-id="${nextEvent.id}"]`);
    if (!targetEl) return;
    targetEl.scrollIntoView({ behavior: "instant", block: "center" });
  });

  useLayoutEffect(() => {
    scrollToNextEvent();
  }, []);

  return (
    <div className="flex max-h-[min(500px,calc(100dvh-5rem))] min-h-[150px] w-[400px] flex-col overflow-hidden rounded-md bg-white outline-2 outline-solid">
      <div className="flex h-11 items-center justify-start gap-1 bg-black p-2 text-white">
        <i className="i-mdi-bookmark size-5" />
        <span>ブックマーク ({bookmarkCount}) </span>

        <button
          className="absolute -right-1 z-10 flex size-11 items-center justify-center text-gray-200 hover:text-gray-400 active:text-gray-400"
          onClick={(e) => closePopover(e.nativeEvent)}
        >
          <i className="i-mdi-close size-6" />
        </button>
      </div>
      <div className="flex w-full [scrollbar-width:none] flex-col gap-2 overflow-auto p-1 pb-10">
        {bookmarkCount === 0 ? (
          <div className="p-2">Bookmarkしたイベントがここに載ります</div>
        ) : (
          <div className="grid">
            {bookmarkEventList.map((liverEvent) => (
              <button
                key={liverEvent.id}
                popoverTarget={liverEvent.id}
                onClick={() => scrollToLiverEventTop(liverEvent.id)}
                onMouseOver={() => hoverEvent(liverEvent)}
                onMouseLeave={unhoverEvent}
                className="hover:bg-gray-200"
                data-fav-event-id={liverEvent.id}
              >
                <div className="flex items-center gap-2 p-2 text-start">
                  <img
                    src={getThumbnail(liverEvent.thumbnail, "mq")}
                    className="aspect-video h-[36px] w-[64px] bg-gray-800 object-cover p-0 transition-colors"
                    loading="lazy"
                  />
                  <p className="line-clamp-2 flex-1 text-sm wrap-anywhere">{liverEvent.title}</p>
                  <div className="w-12 text-center text-sm">
                    {getEventTime(liverEvent)}
                    {liverEvent.isLive && (
                      <p className="bg-red-600 text-center text-sm text-white">live</p>
                    )}
                  </div>
                </div>
              </button>
            ))}
            <div className="flex justify-center p-2">
              <button
                className="rounded-sm bg-gray-200 px-4 py-2 text-sm hover:bg-gray-300"
                onClick={(e) => {
                  e.preventDefault();
                  clearBookmarks();
                }}
              >
                clear all
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
