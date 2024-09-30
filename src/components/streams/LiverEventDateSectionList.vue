<script setup lang="ts">
import { onMounted } from "vue";
import LiverEventDateSection from "./LiverEventDateSection.vue";
import type { DateSection } from "@/lib/section";
import { scrollToCurrentTime } from "@/lib/scroll";
import { useEventListStore } from "@/store/eventListStore";

const props = defineProps<{
  dateSectionList: DateSection[];
}>();

const eventListStore = useEventListStore();

onMounted(() => {
  scrollToCurrentTime(eventListStore.dateSectionList, { behavior: "instant" });
});
</script>
<template>
  <div class="overflow-x-hidden pb-60" v-if="props.dateSectionList.length > 0" data-id="event-list">
    <LiverEventDateSection
      v-for="(dateSection, i) in dateSectionList"
      :key="dateSection.time"
      :dateSection="dateSection"
      :prevSection="dateSectionList[i - 1]"
      :nextSection="dateSectionList[i + 1]"
    />
  </div>
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
  --hour16: var(--noon);
  --hour17: var(--evening);
  --hour18: var(--evening);
  --hour19: var(--night);
  --hour20: var(--night);
  --hour21: var(--night);
  --hour22: var(--night);
  --hour23: var(--midnight);
}
</style>
