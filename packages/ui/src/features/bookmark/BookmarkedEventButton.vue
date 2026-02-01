<doc lang="md">
ブックマーク一覧のポップオーバーを開くボタン。ブックマーク数をバッジで表示する。
</doc>

<script setup lang="ts">
import type { LiverEvent } from "@liver-streams/core";
import { computed } from "vue";
import { usePopover } from "../../shared/composables/usePopover";
import { useEventListStore } from "../../store/eventListStore";
import BookmarkedEventPopover from "./BookmarkedEventPopover.vue";
import { useBookmarkStore } from "./bookmarkStore";

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
</script>

<template>
  <button
    class="relative flex size-11 items-center justify-center rounded-full border bg-white shadow-md hover:bg-gray-200"
    @click="popover.togglePopover"
    title="bookmarked events"
  >
    <i
      class="size-8"
      :class="{
        'i-mdi-bookmark': popover.isShow.value,
        'i-mdi-bookmark-outline': !popover.isShow.value,
      }"
    />
    <p
      v-if="bookmarkCount > 0"
      class="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-xl bg-red-700 px-1 text-xs text-white"
    >
      {{ bookmarkCount }}
    </p>
  </button>

  <popover.PopOver
    class="top-auto right-1 bottom-20 left-auto max-w-[calc(100%-8px)] overflow-visible bg-transparent p-0"
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
