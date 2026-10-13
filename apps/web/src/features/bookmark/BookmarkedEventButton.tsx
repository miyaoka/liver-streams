/**
 * ブックマーク一覧のポップオーバーを開くボタン。ブックマーク数をバッジで表示する。
 */
import type { LiverEvent } from "@liver-streams/core";
import { computed, defineComponent } from "vue";
import { usePopover } from "../../shared/composables";
import { useEventListStore } from "../streams";
import BookmarkedEventPopover from "./BookmarkedEventPopover";
import { useBookmarkStore } from "./";

export default defineComponent(
  () => {
    const eventListStore = useEventListStore();
    const bookmarkStore = useBookmarkStore();
    const popover = usePopover();

    const bookmarkEventList = computed(() => {
      const list: LiverEvent[] = [];
      bookmarkStore.bookmarkEventMap.forEach((_value, id) => {
        const liverEvent = eventListStore.liverEventMap.get(id);
        if (liverEvent) {
          list.push(liverEvent);
        }
      });

      return list.sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
    });

    const bookmarkCount = computed(() => bookmarkEventList.value.length);

    return () => (
      <>
        <button
          class="relative flex size-11 items-center justify-center rounded-full border bg-white shadow-md hover:bg-gray-200"
          onClick={popover.togglePopover}
          title="bookmarked events"
        >
          <i
            class={[
              "size-8",
              {
                "i-mdi-bookmark": popover.isShow.value,
                "i-mdi-bookmark-outline": !popover.isShow.value,
              },
            ]}
          />
          {bookmarkCount.value > 0 && (
            <p class="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-xl bg-red-700 px-1 text-xs text-white">
              {bookmarkCount.value}
            </p>
          )}
        </button>

        <popover.PopOver class="bookmarked-event-button-popover top-auto right-1 bottom-20 left-auto max-w-[calc(100%-8px)] overflow-visible bg-transparent p-0">
          <BookmarkedEventPopover bookmarkEventList={bookmarkEventList.value} />
        </popover.PopOver>
      </>
    );
  },
  { name: "BookmarkedEventButton" },
);
