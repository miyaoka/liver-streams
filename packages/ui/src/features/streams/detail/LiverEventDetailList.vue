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
