<script setup lang="ts">
import { useEventListStore } from "@/store/eventListStore";

const eventListStore = useEventListStore();

function scrollToCurrentTime() {
  const now = Date.now();
  // dateSection内のtimeSectionをflat化
  const timeSectionList = eventListStore.dateSectionList.flatMap(
    (section) => section.timeSectionList,
  );
  // 現在時刻より後のtimeSectionを取得
  const afterNowIndex = timeSectionList.findIndex((timeSection) => timeSection.time > now);

  // 現在より後のsectionがあればその手前、またはそのsection
  // 現在より後が無ければイベントが有る最後のsection
  const targetTimeSection =
    afterNowIndex > 0
      ? (timeSectionList[afterNowIndex - 1] ?? timeSectionList[afterNowIndex])
      : timeSectionList.filter((timeSection) => timeSection.events.length > 0).at(-1);

  if (!targetTimeSection) return;

  let target = document.querySelector(`[data-time="${targetTimeSection.time}"]`);
  if (!target) return;
  console.log("target", target);

  target.scrollIntoView({ behavior: "smooth" });
}
</script>

<template>
  <button
    title="scroll to current time"
    class="p-1 flex bg-white rounded shadow-md"
    @click="scrollToCurrentTime"
  >
    <i class="i-mdi-history w-8 h-8" />
  </button>
</template>
