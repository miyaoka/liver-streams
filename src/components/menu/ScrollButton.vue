<script setup lang="ts">
import { scrollToCurrentTime } from "@/lib/scroll";
import { useEventListStore } from "@/store/eventListStore";

const eventListStore = useEventListStore();
</script>

<template>
  <button
    title="scroll to current time"
    class="p-1 flex bg-white rounded shadow-md"
    @click="scrollToCurrentTime(eventListStore.dateSectionList)"
  >
    <i class="i-mdi-history w-8 h-8" />
  </button>
</template>
