<script setup lang="ts">
import { useIntervalFn } from "@vueuse/core";
import { onMounted } from "vue";
import FooterMenu from "../components/menu/FooterMenu.vue";
import HeaderMenu from "../components/menu/HeaderMenu.vue";
import LiverEventDetailList from "../components/streams/detail/LiverEventDetailList.vue";
import LiverEventDateSectionList from "../components/streams/LiverEventDateSectionList.vue";
import { useEventListStore } from "../store/eventListStore";

const fetchInterval = 1 * 60 * 1000; // 1min
const eventListStore = useEventListStore();

onMounted(async () => {
  // イベント情報を更新
  const updateList = () => eventListStore.updateLiverEventList();

  // 一定時間ごとにスケジュールを再取得
  useIntervalFn(updateList, fetchInterval);

  // 初回取得
  updateList();
});
</script>

<template>
  <main class="text-[clamp(11px,11px+0.25vw,15px)]">
    <LiverEventDateSectionList
      :dateSectionList="eventListStore.dateSectionList"
      :isLoading="eventListStore.isLoading"
    />
    <LiverEventDetailList />
    <HeaderMenu />
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
