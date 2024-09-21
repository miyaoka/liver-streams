<script setup lang="ts">
import { onMounted } from "vue";
import LiverEventDateSection from "./LiverEventDateSection.vue";
import type { DateSection } from "@/store/eventListStore";

const props = defineProps<{
  dateSectionList: DateSection[];
}>();

onMounted(() => {
  const now = Date.now();
  const sections = [...document.querySelectorAll("section[data-time]")];
  const sectionIndex = sections.findIndex((el) => {
    const time = Number(el.getAttribute("data-time"));
    // 現在時刻を超える最初のセクションを探す
    if (time > now) return true;
  });
  // 現在時刻の直前のセクション
  const prevSection = sections[sectionIndex - 1];

  if (prevSection) {
    // セクションにスクロール
    prevSection.scrollIntoView({ behavior: "instant", block: "start" });
  }
});
</script>
<template>
  <div
    class="eventList h-screen w-screen overflow-y-scroll pb-60 bg-[#3a3c6d]"
    v-if="props.dateSectionList.length > 0"
  >
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

<style scoped>
.eventList {
  scrollbar-width: none;
}
</style>
