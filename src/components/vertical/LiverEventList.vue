<script setup lang="ts">
import { onMounted } from "vue";
import LiverEventDateSection from "./LiverEventDateSection.vue";
import { useEventListStore, type DateSection } from "@/store/eventListStore";

const props = defineProps<{
  dateSectionList: DateSection[];
}>();

const eventListStore = useEventListStore();

onMounted(() => {
  eventListStore.scrollToCurrentTime({ behavior: "instant" });
});
</script>
<template>
  <div class="pb-60 bg-[var(--hour0)]" v-if="props.dateSectionList.length > 0" data-id="event-list">
    <LiverEventDateSection
      v-for="(dateSection, i) in dateSectionList"
      :key="dateSection.time"
      :dateSection="dateSection"
      :prevSection="dateSectionList[i - 1]"
      :nextSection="dateSectionList[i + 1]"
    />
  </div>
  <div
    v-else
    class="px-4 py-20 flex flex-col h-screen items-center justify-center bg-gradient-to-b from-zinc-200 to-white"
  >
    <i class="i-mdi-file-document-error w-16 h-16 text-zinc-400" />
    <p class="text-base font-bold text-zinc-400">no data</p>
  </div>
</template>

<style>
html {
  scrollbar-width: none;
}
:root {
  --hour0: #121450;
  --hour1: #13184d;
  --hour2: #141e4f;
  --hour3: #161f53;
  --hour4: #182457;
  --hour5: #192751;
  --hour6: #505fab;
  --hour7: #9ecae6;
  --hour8: #a3cddd;
  --hour9: #b2ced7;
  --hour10: #b4d4df;
  --hour11: #c8ecf9;
  --hour12: #d8eaeb;
  --hour13: #cce5ee;
  --hour14: #cde6ee;
  --hour15: #b7cce3;
  --hour16: #7f86b7;
  --hour17: #ab81a4;
  --hour18: #da9c9e;
  --hour19: #a47fae;
  --hour20: #6d6b97;
  --hour21: #44446a;
  --hour22: #40407b;
  --hour23: #292b66;
}
</style>
