/**
 * ブックマーク一覧のポップオーバーを開くボタン。ブックマーク数をバッジで表示する。
 */
import type { LiverEvent } from "@liver-streams/core";
import { useMemo } from "react";
import { Popover, usePopover } from "../../shared/composables";
import { useEventListStore } from "../streams";
import BookmarkedEventPopover from "./BookmarkedEventPopover";
import { useBookmarkStore } from "./";

export default function BookmarkedEventButton() {
  const liverEventMap = useEventListStore((state) => state.liverEventMap);
  const bookmarkEventMap = useBookmarkStore((state) => state.bookmarkEventMap);
  const popover = usePopover();

  const bookmarkEventList = useMemo(() => {
    const list: LiverEvent[] = [];
    bookmarkEventMap.forEach((_value, id) => {
      const liverEvent = liverEventMap.get(id);
      if (liverEvent) {
        list.push(liverEvent);
      }
    });

    return list.sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
  }, [bookmarkEventMap, liverEventMap]);

  const bookmarkCount = bookmarkEventList.length;

  return (
    <>
      <button
        className="relative flex size-11 items-center justify-center rounded-full border bg-white shadow-md hover:bg-gray-200"
        onClick={popover.togglePopover}
        title="bookmarked events"
      >
        <i
          className={["size-8", popover.isShow ? "i-mdi-bookmark" : "i-mdi-bookmark-outline"].join(
            " ",
          )}
        />
        {bookmarkCount > 0 && (
          <p className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-xl bg-red-700 px-1 text-xs text-white">
            {bookmarkCount}
          </p>
        )}
      </button>

      <Popover
        control={popover}
        className="bookmarked-event-button-popover top-auto right-1 bottom-20 left-auto max-w-[calc(100%-8px)] overflow-visible bg-transparent p-0"
      >
        <BookmarkedEventPopover bookmarkEventList={bookmarkEventList} />
      </Popover>
    </>
  );
}
