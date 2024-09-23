<script setup lang="ts">
import { scrollToCurrentTime } from "@/lib/scroll";
import { useEventListStore } from "@/store/eventListStore";

const eventListStore = useEventListStore();
</script>

<template>
  <button
    title="scroll to current time"
    class="flex h-11 w-11 items-center justify-center rounded bg-white shadow-md"
    @click="scrollToCurrentTime(eventListStore.dateSectionList)"
  >
    <i class="i-mdi-history h-8 w-8" />
  </button>
</template>
