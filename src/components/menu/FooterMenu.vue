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

const focusStore = useFocusStore();
const eventListStore = useEventListStore();

const multiplayerUrl = "https://multi-player.vercel.app/";

function openInMultiPlayer() {
  const idList = Array.from(focusStore.multiSelectEventIdSet);
  if (idList.length === 0) return;

  const eventList = idList.flatMap((id) => eventListStore.liverEventMap.get(id) ?? []);
  const vidList = eventList.flatMap((event) => {
    const videoId = getYouTubeVideoId(event.url);
    return videoId ?? [];
  });

  const url = new URL(multiplayerUrl);
  url.search = new URLSearchParams(vidList.map((vid) => ["v", vid])).toString();
  window.open(url.href, "_blank");
}
</script>

<template>
  <footer class="relative z-30">
    <FilteringButton />

    <div class="fixed bottom-4 right-4 flex flex-col items-end gap-4">
      <div
        v-if="focusStore.isMultiSelectMode"
        class="flex items-center justify-center gap-4 rounded-xl bg-green-700 px-4 py-2 text-white"
      >
        <div class="flex flex-col">
          <p class="text-lg font-bold">複数選択モード</p>
          <p>選択した動画をマルチビュー画面で表示</p>
          <p>（{{ focusStore.multiSelectEventIdSet.size }}個選択中）</p>
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
      <div class="flex flex-row items-end gap-2">
        <MultiSelectButton />
        <KeywordListButton />
        <BookmarkedEventButton />
        <AddedEventButton />
        <LiveFilterButton />
        <ScrollButton />
      </div>
    </div>
  </footer>
</template>
