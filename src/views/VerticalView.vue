<script setup lang="ts">
import { onMounted, ref } from "vue";
import { getSchedule, type Schedule } from "@/api/hololive/schedule";
import { getTalentMap, getSchedule as gs, type Stream } from "@/api/nijisanji/nijisanji";
import day0 from "@/api/nijisanji/sample2/day0.json";
import VerticalSchedule from "@/components/vertical/VerticalSchedule.vue";

const data = ref<Schedule | null>(null);

async function setSchedule() {
  data.value = await getSchedule();

  const talentMap = await getTalentMap();
  const videos = await gs(day0 as Stream);

  const vs = videos.flatMap((video) => {
    const { talentId, collaboTalentIds, ...rest } = video;
    const talent = talentMap.get(talentId);

    if (!talent) {
      console.error(`Liver not found: ${talentId}`);
      return [];
    }

    const collaboTalents = collaboTalentIds.flatMap((collaboTalentId) => {
      const collaboLiver = talentMap.get(collaboTalentId);

      if (!collaboLiver) {
        console.error(`collabo liver not found: ${collaboTalentId}`);
        return [];
      }

      return collaboLiver;
    });

    return {
      ...rest,
      talent,
      collaboTalents,
    };
  });

  console.log("vs", vs);
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
