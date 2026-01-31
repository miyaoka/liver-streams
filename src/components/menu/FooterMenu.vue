<script setup lang="ts">
import AddedEventButton from "./addedEvent/AddedEventButton.vue";
import BookmarkedEventButton from "./bookmarkedEvent/BookmarkedEventButton.vue";
import FilteringButton from "./FilteringButton.vue";
import KeywordListButton from "./keywordList/KeywordListButton.vue";
import LiveFilterButton from "./LiveFilterButton.vue";
import MultiSelectButton from "./MultiSelectButton.vue";
import ScrollButton from "./ScrollButton.vue";
import { getYouTubeVideoId } from "@/lib/youtube";
import { useEventListStore } from "@/store/eventListStore";
import { useFocusStore } from "@/store/focusStore";
import { useSearchStore } from "@/store/searchStore";

const focusStore = useFocusStore();
const eventListStore = useEventListStore();
const searchStore = useSearchStore();

const multiviewPlayerUrl = "https://multiview-player.vercel.app/";

function openInMultiPlayer() {
  const idList = Array.from(focusStore.multiSelectEventIdSet);
  if (idList.length === 0) return;

  const eventList = idList.flatMap((id) => eventListStore.liverEventMap.get(id) ?? []);
  const vidList = eventList.flatMap((event) => {
    const videoId = getYouTubeVideoId(event.url);
    return videoId ?? [];
  });

  const url = new URL(multiviewPlayerUrl);
  url.search = new URLSearchParams(vidList.map((vid) => ["v", vid])).toString();
  window.open(url.href, "_blank");
}

function selectAll() {
  focusStore.isMultiSelectMode = true;
  focusStore.multiSelectEventIdSet.clear();
  eventListStore.filteredEventList.forEach((event) => {
    focusStore.multiSelectEventIdSet.add(event.id);
  });
}
</script>

<template>
  <footer class="relative z-30">
    <FilteringButton />

    <div class="fixed right-4 bottom-4 flex flex-col items-end gap-2">
      <div
        v-if="focusStore.isMultiSelectMode"
        class="flex items-center justify-center gap-4 rounded-xl bg-green-700 px-4 py-2 text-white shadow-md"
      >
        <div class="flex flex-col gap-1">
          <p class="text-lg font-bold">複数選択モード</p>
          <p>
            選択した動画をマルチビュー画面で表示<br />
            （{{ focusStore.multiSelectEventIdSet.size }}個選択中）
          </p>
          <button
            v-if="searchStore.hasQuery"
            class="flex h-8 items-center justify-center gap-1 rounded-full bg-green-600/90 px-2"
            @click="selectAll"
          >
            <i class="i-mdi-check-all size-6" />
            全選択
          </button>
        </div>
        <div>
          <button
            :disabled="focusStore.multiSelectEventIdSet.size === 0"
            class="flex size-11 items-center justify-center rounded-full bg-white px-2 py-1 text-black disabled:opacity-20"
            title="マルチビュー画面で開く"
            @click="openInMultiPlayer"
          >
            <i class="i-mdi-open-in-new size-8" />
          </button>
        </div>
      </div>
      <div class="flex flex-col items-end gap-2">
        <MultiSelectButton />
        <div class="flex flex-row items-end gap-2">
          <KeywordListButton />
          <BookmarkedEventButton />
          <AddedEventButton />
          <LiveFilterButton />
          <ScrollButton />
        </div>
      </div>
    </div>
  </footer>
</template>
