<script setup lang="ts">
import { computed, nextTick } from "vue";
import type { LiverEvent } from "@/services/api";
import { usePopover } from "@/composable/usePopover";
import { scrollToLiverEventTop } from "@/lib/scroll";
import { getThumnail } from "@/lib/youtube";
import { useDateStore } from "@/store/dateStore";
import { useEventListStore } from "@/store/eventListStore";
import { useFocusStore } from "@/store/focusStore";
import { useStorageStore } from "@/store/storageStore";
import { compareDate, getDateTime } from "@/utils/date";
import { hhmmDateFormatter, toRelativeTime } from "@/utils/dateFormat";
import { closePopover } from "@/utils/popover";

const eventListStore = useEventListStore();
const storageStore = useStorageStore();
const focusStore = useFocusStore();

const popover = usePopover({
  onShow: async () => {
    await nextTick();

    const now = Date.now();
    // 現在より後で最も近いイベントにスクロールする
    const nextEvent =
      bookmarkEventList.value.find((event) => event.startAt.getTime() > now) ??
      bookmarkEventList.value.at(-1);
    if (!nextEvent) return;

    const targetEl = document.querySelector(`[data-fav-event-id="${nextEvent.id}"]`);
    if (!targetEl) return;
    targetEl.scrollIntoView({ behavior: "instant", block: "center" });
  },
});

const dateStore = useDateStore();

const bookmarkEventList = computed(() => {
  const list: LiverEvent[] = [];
  storageStore.bookmarkEventSet.forEach((id) => {
    const liverEvent = eventListStore.liverEventMap.get(id);
    if (liverEvent) {
      list.push(liverEvent);
    }
  });

  return list.sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
});

const bookmarkCount = computed(() => bookmarkEventList.value.length);

function getEventTime(liverEvent: LiverEvent) {
  const startAt = liverEvent.startAt;
  const startDateTime = getDateTime(startAt);

  const dateDiff = compareDate({
    baseDateTime: dateStore.currentDateTime,
    targetDateTime: startDateTime,
  });

  // 今日なら時刻を返す
  if (dateDiff === 0) {
    return hhmmDateFormatter.format(startAt);
  }

  // 別の日なら相対時刻を返す
  return toRelativeTime(startDateTime - dateStore.currentDateTime);
}

function showPopover() {
  popover.showPopover();
}
</script>

<template>
  <button
    class="relative flex size-11 items-center justify-center rounded-full border bg-white shadow-md hover:bg-gray-200"
    @click="showPopover"
    title="bookmarked events"
  >
    <i class="i-mdi-bookmark-outline size-8" />
    <p
      v-if="bookmarkCount > 0"
      :class="`absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-xl bg-red-700 px-1 text-xs text-white`"
    >
      {{ bookmarkCount }}
    </p>
  </button>

  <popover.PopOver
    class="bottom-2 left-auto right-1 top-auto max-w-[calc(100%-8px)] overflow-visible bg-transparent p-0"
  >
    <div
      class="flex max-h-[500px] min-h-[150px] w-[400px] flex-col overflow-hidden rounded-md bg-white outline outline-2"
    >
      <div class="flex h-11 items-center justify-start gap-1 bg-black p-2 text-white">
        <i class="i-mdi-bookmark-outline size-5" />
        <span>ブックマーク ({{ bookmarkCount }}) </span>

        <button
          class="absolute -right-1 z-10 flex size-11 items-center justify-center text-gray-200 hover:text-gray-400 active:text-gray-400"
          @click="closePopover"
        >
          <i class="i-mdi-close size-6" />
        </button>
      </div>
      <div class="flex w-full flex-col gap-2 overflow-auto p-1 pb-10 [scrollbar-width:none]">
        <div v-if="bookmarkCount === 0" class="p-2">Bookmarkしたイベントがここに載ります</div>

        <div v-else class="grid">
          <button
            v-for="liverEvent in bookmarkEventList"
            :key="liverEvent.id"
            :popovertarget="liverEvent.id"
            @click="scrollToLiverEventTop(liverEvent.id)"
            @mouseover="focusStore.hoverEvent(liverEvent)"
            @mouseleave="focusStore.unhoverEvent"
            class="hover:bg-gray-200"
            :data-fav-event-id="liverEvent.id"
          >
            <div class="flex items-center gap-2 p-2 text-start">
              <img
                :src="getThumnail(liverEvent.thumbnail, 'mq')"
                class="_thumb aspect-video h-[36px] w-[64px] bg-gray-800 object-cover p-0 transition-colors"
                loading="lazy"
              />
              <p class="line-clamp-2 flex-1 text-sm [overflow-wrap:anywhere]">
                {{ liverEvent.title }}
              </p>
              <div class="w-12 text-center text-sm">
                {{ getEventTime(liverEvent) }}
                <p v-if="liverEvent.isLive" class="bg-red-600 text-center text-sm text-white">
                  live
                </p>
              </div>
            </div>
          </button>
          <div class="flex justify-center p-2">
            <button
              class="rounded bg-gray-200 px-4 py-2 text-sm hover:bg-gray-300"
              @click.prevent="storageStore.resetBookmarkEventSet"
            >
              clear all
            </button>
          </div>
        </div>
      </div>
    </div>
  </popover.PopOver>
</template>

<style scoped>
[popover] {
  &:popover-open {
    animation: fadeIn 0.2s forwards;
  }
}

@keyframes fadeIn {
  from {
    translate: 0 50%;
  }
}
</style>
