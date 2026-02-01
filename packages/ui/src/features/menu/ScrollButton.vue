<doc lang="md">
現在時刻のセクションまでスクロールするボタン。一覧を遡って見た後に現在位置に戻るために使用する。
</doc>

<script setup lang="ts">
import { scrollToCurrentTime } from "../../shared/lib/scroll";
import { useEventListStore } from "../../store/eventListStore";

const eventListStore = useEventListStore();
</script>

<template>
  <button
    title="scroll to current time"
    class="flex size-11 items-center justify-center rounded-full border bg-white shadow-md hover:bg-gray-200"
    @click="scrollToCurrentTime(eventListStore.dateSectionList)"
  >
    <i class="i-mdi-history size-8" />
  </button>
</template>
