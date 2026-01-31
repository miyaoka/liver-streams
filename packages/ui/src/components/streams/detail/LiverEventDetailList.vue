<script setup lang="ts">
import LiverEventDetailListItem from "./LiverEventDetailListItem.vue";
import { useEventListStore } from "@/store/eventListStore";

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
