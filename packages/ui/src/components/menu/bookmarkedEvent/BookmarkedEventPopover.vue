<script setup lang="ts">
import type { LiverEvent } from "@liver-streams/core";
import {
  getThumbnail,
  compareDate,
  getDateTime,
  hhmmDateFormatter,
  toRelativeTime,
} from "@liver-streams/core";
import { computed, onMounted } from "vue";
import { scrollToLiverEventTop } from "../../../lib/scroll";
import { useBookmarkStore } from "../../../store/bookmarkStore";
import { useDateStore } from "../../../store/dateStore";
import { useFocusStore } from "../../../store/focusStore";
import { closePopover } from "../../../utils/popover";

const props = defineProps<{
  bookmarkEventList: LiverEvent[];
}>();

const focusStore = useFocusStore();
const dateStore = useDateStore();
const bookmarkStore = useBookmarkStore();

const bookmarkCount = computed(() => props.bookmarkEventList.length);

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

onMounted(() => {
  const now = Date.now();
  // 現在より後で最も近いイベントにスクロールする
  const nextEvent =
    props.bookmarkEventList.find((event) => event.startAt.getTime() > now) ??
    props.bookmarkEventList.at(-1);
  if (!nextEvent) return;

  const targetEl = document.querySelector(`[data-fav-event-id="${nextEvent.id}"]`);
  if (!targetEl) return;
  targetEl.scrollIntoView({ behavior: "instant", block: "center" });
});
</script>

<template>
  <div
    class="flex max-h-[min(500px,calc(100dvh-5rem))] min-h-[150px] w-[400px] flex-col overflow-hidden rounded-md bg-white outline-2 outline-solid"
  >
    <div class="flex h-11 items-center justify-start gap-1 bg-black p-2 text-white">
      <i class="i-mdi-bookmark size-5" />
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
              :src="getThumbnail(liverEvent.thumbnail, 'mq')"
              class="_thumb aspect-video h-[36px] w-[64px] bg-gray-800 object-cover p-0 transition-colors"
              loading="lazy"
            />
            <p class="line-clamp-2 flex-1 text-sm wrap-anywhere">
              {{ liverEvent.title }}
            </p>
            <div class="w-12 text-center text-sm">
              {{ getEventTime(liverEvent) }}
              <p v-if="liverEvent.isLive" class="bg-red-600 text-center text-sm text-white">live</p>
            </div>
          </div>
        </button>
        <div class="flex justify-center p-2">
          <button
            class="rounded-sm bg-gray-200 px-4 py-2 text-sm hover:bg-gray-300"
            @click.prevent="bookmarkStore.bookmarkEventMap.clear"
          >
            clear all
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
