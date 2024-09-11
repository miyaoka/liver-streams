<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { LiverEvent } from "@/api";
import { getHoloEvents } from "@/api/hololive/schedule";
import { getNijiLiverMap, getNijiStreams, type NijiLiverMap } from "@/api/nijisanji/nijisanji";
import FooterMenu from "@/components/menu/FooterMenu.vue";
import HeaderMenu from "@/components/menu/HeaderMenu.vue";
import VerticalSchedule from "@/components/vertical/VerticalSchedule.vue";
import { getChannelIcon } from "@/utils/icons";

const liverEventList = ref<LiverEvent[]>([]);
const isDev = false;

async function getStreams({
  isDev,
  nijiLiverMap,
}: {
  isDev: boolean;
  nijiLiverMap: NijiLiverMap;
}): Promise<LiverEvent[]> {
  const [holoEvents, nijiEvents] = await Promise.all([
    getHoloEvents(isDev),
    getNijiEvents({ isDev, nijiLiverMap }),
  ]);

  const wholeEvents = [...holoEvents, ...nijiEvents].sort(
    (a, b) => a.startAt.getTime() - b.startAt.getTime(),
  );
  return wholeEvents;
}

async function getNijiEvents({
  isDev,
  nijiLiverMap,
}: {
  isDev: boolean;
  nijiLiverMap: NijiLiverMap;
}): Promise<LiverEvent[]> {
  const nijiStreams = await getNijiStreams(isDev);

  function getTalent(id: string) {
    const talent = nijiLiverMap[id];
    if (!talent) {
      console.warn(`talent not found: ${id}`);
      return null;
    }
    return {
      name: talent.name,
      image: getChannelIcon(talent.name),
    };
  }

  const events: LiverEvent[] = nijiStreams.flatMap((stream) => {
    const { title, url, thumbnail, startAt, endAt, isLive, talentId, collaboTalentIds } = stream;
    const talent = getTalent(talentId);
    if (!talent) return [];
    return {
      affilication: "nijisanji",
      startAt: new Date(startAt),
      title,
      url,
      thumbnail,
      endAt: endAt ? new Date(endAt) : null,
      isLive,
      talent,
      collaboTalents: collaboTalentIds.flatMap((id) => getTalent(id) ?? []),
    };
  });

  return events;
}

onMounted(async () => {
  const nijiLiverMap = await getNijiLiverMap(true);

  const setStreams = () => {
    getStreams({ isDev, nijiLiverMap }).then((streams) => {
      liverEventList.value = streams;
    });
  };
  setStreams();

  // 5分毎にスケジュールを再取得
  setInterval(setStreams, 5 * 60 * 1000);
});
</script>

<template>
  <main class="text-[clamp(11px,11px+0.25vw,15px)]" v-if="liverEventList.length > 0">
    <HeaderMenu />
    <VerticalSchedule :liverEventList="liverEventList" />
    <FooterMenu />
  </main>
</template>

<style scoped>
main {
  font-family: "Noto Sans JP", sans-serif;
  font-optical-sizing: auto;
  font-weight: 400;
  font-style: normal;
}
</style>
