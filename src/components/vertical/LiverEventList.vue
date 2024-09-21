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
  --hour0: #3a3c6d;
  --hour1: #3a3e70;
  --hour2: #3b4064;
  --hour3: #3c4368;
  --hour4: #3d466c;
  --hour5: #3e4970;
  --hour6: #4a5a7d;
  --hour7: #c0d8e0;
  --hour8: #c4dce4;
  --hour9: #c8e0e8;
  --hour10: #cce4ec;
  --hour11: #d0e8f0;
  --hour12: #d4ecf4;
  --hour13: #d0e8f0;
  --hour14: #cce4ec;
  --hour15: #c8e0e8;
  --hour16: #c4dce4;
  --hour17: #c0d8e0;
  --hour18: #e4b4b0;
  --hour19: #e49894;
  --hour20: #606080;
  --hour21: #585878;
  --hour22: #505070;
  --hour23: #3a3c6d;
}
</style>
