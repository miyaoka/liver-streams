<script setup lang="ts">
import { onMounted } from "vue";
import FooterMenu from "@/components/menu/FooterMenu.vue";
import HeaderMenu from "@/components/menu/HeaderMenu.vue";
import LiverEventDetailList from "@/components/streams/detail/LiverEventDetailList.vue";
import LiverEventDateSectionList from "@/components/streams/LiverEventDateSectionList.vue";
import { fetchNijiLiverMap } from "@/services/nijisanji";
import { useEventListStore } from "@/store/eventListStore";

const fetchInterval = 1 * 60 * 1000; // 1min
const eventListStore = useEventListStore();

onMounted(async () => {
  // にじさんじのライバー情報を取得
  const nijiLiverMap = await fetchNijiLiverMap();

  // イベント情報を更新
  const updateList = () => eventListStore.updateLiverEventList(nijiLiverMap);

  // 一定時間ごとにスケジュールを再取得
  setInterval(updateList, fetchInterval);

  // 初回取得
  updateList();
});
</script>

<template>
  <main class="text-[clamp(11px,11px+0.25vw,15px)]" v-if="eventListStore.liverEventList">
    <HeaderMenu />
    <LiverEventDateSectionList :dateSectionList="eventListStore.dateSectionList" />
    <LiverEventDetailList />
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
