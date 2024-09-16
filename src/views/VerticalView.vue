<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { LiverEvent } from "@/api";
import { getHoloEvents } from "@/api/hololive/schedule";
import {
  getNijiLiverMap,
  getNijiStreams,
  type NijiLiverMap,
  type NijiStream,
} from "@/api/nijisanji/nijisanji";
import FooterMenu from "@/components/menu/FooterMenu.vue";
import HeaderMenu from "@/components/menu/HeaderMenu.vue";
import LiverEventList from "@/components/vertical/LiverEventList.vue";
import { getChannelIcon } from "@/utils/icons";

const liverEventList = ref<LiverEvent[]>([]);
const fetchInterval = 1 * 60 * 1000; // 1min

// ホロライブとにじさんじの配信情報を取得
async function getStreams({ nijiLiverMap }: { nijiLiverMap: NijiLiverMap }): Promise<LiverEvent[]> {
  const [holoEvents, nijiStreams] = await Promise.all([getHoloEvents(), getNijiStreams()]);

  const nijiEvents = getNijiEvents({ nijiLiverMap, nijiStreams });
  const wholeEvents = [...holoEvents, ...nijiEvents].sort(
    (a, b) => a.startAt.getTime() - b.startAt.getTime(),
  );
  return wholeEvents;
}

// 配信情報のtalentIdからtalentMapを参照して変換
function getNijiEvents({
  nijiLiverMap,
  nijiStreams,
}: {
  nijiLiverMap: NijiLiverMap;
  nijiStreams: NijiStream[];
}): LiverEvent[] {
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
  // にじさんじのライバー情報を取得
  const nijiLiverMap = await getNijiLiverMap();

  // イベント情報を更新
  const updateStreams = () => {
    getStreams({ nijiLiverMap }).then((streams) => {
      liverEventList.value = streams;
    });
  };

  // 一定時間ごとにスケジュールを再取得
  setInterval(updateStreams, fetchInterval);

  // 初回取得
  updateStreams();
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
