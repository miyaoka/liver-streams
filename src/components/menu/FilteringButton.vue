<script setup lang="ts">
import { useEventListStore } from "@/store/eventListStore";
import { useSearchStore } from "@/store/searchStore";

const searchStore = useSearchStore();
const eventListStore = useEventListStore();

function clear() {
  searchStore.setSearchTerm("");
}
</script>

<template>
  <button
    v-if="searchStore.hasQuery"
    class="fixed inset-0 bottom-4 top-auto z-20 m-auto flex h-11 w-fit items-center justify-center gap-1 rounded-full bg-blue-700 px-3 font-bold text-white shadow-md hover:bg-blue-800"
    @click="clear"
  >
    <span>絞り込み表示中: {{ eventListStore.filteredEventList.length }}件</span>

    <div class="i-mdi-cross-circle size-6" />
  </button>
</template>

<style scoped>
button {
  transition: translate 0.3s;
  @starting-style {
    opacity: 0;
    translate: 0 100px;
  }
}
</style>
