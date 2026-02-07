<doc lang="md">
配信一覧のメインビュー。にじさんじ・ホロライブの配信情報を統合表示する。

## 機能

- イベント情報を1分間隔で自動更新
- 日付・時間セクションで配信を整理して表示
- ヘッダー・フッターメニューによる操作
</doc>

<script setup lang="ts">
import { useIntervalFn } from "@vueuse/core";
import { onMounted } from "vue";
import FooterMenu from "../features/menu/FooterMenu.vue";
import HeaderMenu from "../features/menu/HeaderMenu.vue";
import LiverEventDetailList from "../features/streams/detail/LiverEventDetailList.vue";
import LiverEventDateSectionList from "../features/streams/LiverEventDateSectionList.vue";
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
