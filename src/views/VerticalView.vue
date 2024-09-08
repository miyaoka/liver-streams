<script setup lang="ts">
import { onMounted, ref } from "vue";
import { getSchedule, type Schedule } from "@/api/hololive/schedule";
import { getEvents, getTalentMap } from "@/api/nijisanji/nijisanji";
import VerticalSchedule from "@/components/vertical/VerticalSchedule.vue";

const data = ref<Schedule | null>(null);

async function setSchedule() {
  data.value = await getSchedule();

  const talentMap = await getTalentMap(true);
  const events = await getEvents({ isDev: true, talentMap });
  console.log("events", events);
}
onMounted(async () => {
  setSchedule();
  // 5分毎にスケジュールを再取得
  setInterval(setSchedule, 5 * 60 * 1000);
});
</script>

<template>
  <main class="text-[clamp(8px,3vw,16px)]">
    <VerticalSchedule v-if="data" :data="data" />
  </main>
</template>

<style>
/* スクロールバーが消えてもガタつかないようにする */
html {
  /* scrollbar-gutter: stable; */
}
/* dialogやpopoverが開かれていたらスクロールを禁止する */
html:has(dialog:modal),
html:has([popover]:popover-open) {
  /* overflow: hidden; */
}
</style>
