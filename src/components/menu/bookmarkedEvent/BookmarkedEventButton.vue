<script setup lang="ts">
import { computed, nextTick } from "vue";
import BookmarkedEventPopover from "./BookmarkedEventPopover.vue";
import type { LiverEvent } from "@/services/api";
import { usePopover } from "@/composable/usePopover";

import { useEventListStore } from "@/store/eventListStore";
import { useStorageStore } from "@/store/storageStore";

const eventListStore = useEventListStore();
const storageStore = useStorageStore();

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
    <BookmarkedEventPopover :bookmarkEventList="bookmarkEventList" />
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
