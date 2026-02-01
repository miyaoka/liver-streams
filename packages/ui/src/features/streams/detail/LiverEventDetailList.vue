<doc lang="md">
全イベントの詳細ポップオーバーを事前生成するコンテナ。

カードクリック時にポップオーバーを即座に表示するため、DOM 上に全イベントのポップオーバー要素を保持する。
</doc>

<script setup lang="ts">
import { useEventListStore } from "../../../store/eventListStore";
import LiverEventDetailListItem from "./LiverEventDetailListItem.vue";

const eventListStore = useEventListStore();
</script>

<template>
  <div>
    <LiverEventDetailListItem
      :liverEvent="liverEvent"
      v-for="liverEvent in eventListStore.liverEventList"
      :key="liverEvent.id"
    />
  </div>
</template>
