<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { LiverEvent } from "@/api";
import { getHoloEvents } from "@/api/hololive/schedule";
import { getNijiLiverMap, getNijiStreams, type NijiLiverMap } from "@/api/nijisanji/nijisanji";
import FooterMenu from "@/components/menu/FooterMenu.vue";
import HeaderMenu from "@/components/menu/HeaderMenu.vue";
import LiverEventList from "@/components/vertical/LiverEventList.vue";
import { getChannelIcon } from "@/utils/icons";

const liverEventList = ref<LiverEvent[]>([]);
const fetchInterval = 1 * 60 * 1000; // 1min

async function getStreams({ nijiLiverMap }: { nijiLiverMap: NijiLiverMap }): Promise<LiverEvent[]> {
  const [holoEvents, nijiEvents] = await Promise.all([
    getHoloEvents(),
    getNijiEvents({ nijiLiverMap }),
  ]);

  const wholeEvents = [...holoEvents, ...nijiEvents].sort(
    (a, b) => a.startAt.getTime() - b.startAt.getTime(),
  );
  return wholeEvents;
}

async function getNijiEvents({
  nijiLiverMap,
}: {
  nijiLiverMap: NijiLiverMap;
}): Promise<LiverEvent[]> {
  const nijiStreams = await getNijiStreams();

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
  const nijiLiverMap = await getNijiLiverMap();

  const setStreams = () => {
    getStreams({ nijiLiverMap }).then((streams) => {
      liverEventList.value = streams;
    });
  };
  setStreams();

  // 一定時間ごとにスケジュールを再取得
  setInterval(setStreams, fetchInterval);
});
</script>

<template>
  <main class="text-[clamp(11px,11px+0.25vw,15px)]" v-if="liverEventList.length > 0">
    <HeaderMenu />
    <LiverEventList :liverEventList="liverEventList" />
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
