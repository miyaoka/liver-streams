<script setup lang="ts">
import type { DateSection } from "@liver-streams/core";
import { nextTick, onMounted, watch } from "vue";
import { scrollToCurrentTime } from "../../shared/lib/scroll";
import { useEventListStore } from "../../store/eventListStore";
import LoadingSpinner from "../common/LoadingSpinner.vue";
import LiverEventDateSection from "./LiverEventDateSection.vue";

const props = defineProps<{
  dateSectionList: DateSection[];
  isLoading: boolean;
}>();

const eventListStore = useEventListStore();

// ローディング完了後に現在時刻へスクロール
watch(
  () => props.isLoading,
  async (isLoading, wasLoading) => {
    if (wasLoading && !isLoading) {
      // DOM更新を待ってからスクロール
      await nextTick();
      scrollToCurrentTime(eventListStore.dateSectionList, { behavior: "instant" });
    }
  },
);

onMounted(() => {
  if (!props.isLoading) {
    scrollToCurrentTime(eventListStore.dateSectionList, { behavior: "instant" });
  }
});
</script>
<template>
  <!-- ローディング中 -->
  <div
    v-if="props.isLoading"
    class="flex h-screen flex-col items-center justify-center px-4 py-20 text-white"
  >
    <LoadingSpinner size="lg" message="読み込み中..." />
  </div>
  <!-- イベントリスト -->
  <div
    v-else-if="props.dateSectionList.length > 0"
    class="overflow-x-clip pb-60"
    data-id="event-list"
  >
    <LiverEventDateSection
      v-for="(dateSection, i) in dateSectionList"
      :key="dateSection.time"
      :dateSection="dateSection"
      :prevSection="dateSectionList[i - 1]"
      :nextSection="dateSectionList[i + 1]"
    />
    <div
      class="pointer-events-none fixed inset-0 bottom-auto z-10 h-20 bg-linear-to-b from-black/40"
    />
  </div>
  <!-- データなし -->
  <div v-else class="flex h-screen flex-col items-center justify-center px-4 py-20 text-white">
    <i class="i-mdi-file-document-error size-16" />
    <p class="text-base font-bold">no data</p>
  </div>
</template>

<style>
html {
  scrollbar-width: none;
  background-color: var(--hour0);
}
:root {
  --midnight: #627ea3;
  --morning: #97cce6;
  --noon: #dff7f9;
  --evening: #f8b074;
  --night: #f6f3be;

  --hour0: var(--midnight);
  --hour1: var(--midnight);
  --hour2: var(--midnight);
  --hour3: var(--midnight);
  --hour4: var(--midnight);
  --hour5: var(--morning);
  --hour6: var(--morning);
  --hour7: var(--morning);
  --hour8: var(--morning);
  --hour9: var(--morning);
  --hour10: var(--noon);
  --hour11: var(--noon);
  --hour12: var(--noon);
  --hour13: var(--noon);
  --hour14: var(--noon);
  --hour15: var(--noon);
  --hour16: var(--evening);
  --hour17: var(--evening);
  --hour18: var(--evening);
  --hour19: var(--night);
  --hour20: var(--night);
  --hour21: var(--night);
  --hour22: var(--midnight);
  --hour23: var(--midnight);
}
</style>
