<script setup lang="ts">
import { onMounted, ref } from "vue";
import { getSchedule, type Schedule } from "@/api/hololive/schedule";
import { getNijiLiversMap, getNijiStreams } from "@/api/nijisanji/nijisanji";
import VerticalSchedule from "@/components/vertical/VerticalSchedule.vue";

const data = ref<Schedule | null>(null);

async function setSchedule() {
  data.value = await getSchedule();
}

async function getNijiEvents() {
  const isDev = true;

  const nijiLiversMap = await getNijiLiversMap(isDev);
  const nijiStreams = await getNijiStreams(isDev);

  const nijiUrl = "https://www.nijisanji.jp";
  function getTalent(id: string) {
    const talent = nijiLiversMap[id];
    if (!talent) {
      console.error(`talent not found: ${id}`);
      return null;
    }
    return {
      name: talent.name,
      image: `${nijiUrl}${talent.image}`,
    };
  }

  const events = nijiStreams.map((stream) => {
    const { title, url, thumnail, startAt, endAt, isLive, talentId, collaboTalentIds } = stream;
    const talent = getTalent(talentId);
    return {
      title,
      url,
      thumnail,
      startAt: new Date(startAt),
      endAt: endAt ? new Date(endAt) : null,
      isLive,
      talent,
      collaboTalents: collaboTalentIds.map((id) => getTalent(id)),
    };
  });

  console.log("events", events);
  return events;
}

const nijiEvents = ref<any[]>([]);
onMounted(async () => {
  setSchedule();
  // 5分毎にスケジュールを再取得
  setInterval(setSchedule, 5 * 60 * 1000);

  // nijiEvents.value = await getNijiEvents();
});
</script>

<template>
  <main class="text-[clamp(8px,3vw,16px)]">
    <VerticalSchedule v-if="data" :data="data" />
  </main>
</template>
