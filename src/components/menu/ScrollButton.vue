<script setup lang="ts">
import { scrollToCurrentTime } from "@/lib/scroll";
import { useEventListStore } from "@/store/eventListStore";

const eventListStore = useEventListStore();
</script>

<template>
  <button
    title="scroll to current time"
    class="flex rounded bg-white p-1 shadow-md"
    @click="scrollToCurrentTime(eventListStore.dateSectionList)"
  >
    <i class="i-mdi-history h-8 w-8" />
  </button>
</template>
