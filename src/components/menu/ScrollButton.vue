<script setup lang="ts">
import { scrollToCurrentTime } from "@/lib/scroll";
import { useEventListStore } from "@/store/eventListStore";

const eventListStore = useEventListStore();
</script>

<template>
  <button
    title="scroll to current time"
    class="flex h-11 w-11 items-center justify-center rounded border bg-white shadow-md hover:bg-gray-200"
    @click="scrollToCurrentTime(eventListStore.dateSectionList)"
  >
    <i class="i-mdi-history h-8 w-8" />
  </button>
</template>
