<script setup lang="ts">
import { useSearchStore } from "../../shared/stores/searchStore";
import { useEventListStore } from "../../store/eventListStore";

const searchStore = useSearchStore();
const eventListStore = useEventListStore();

function close() {
  searchStore.setSearchString("");
}
</script>

<template>
  <div
    v-if="searchStore.hasQuery"
    class="_container fixed inset-0 top-auto bottom-4 z-10 m-auto flex w-fit items-center justify-center gap-2 max-md:bottom-16"
  >
    <button
      class="flex h-11 w-fit items-center gap-2 rounded-full border-2 bg-blue-600 px-2 text-sm font-bold text-white shadow-md"
      @click="close"
    >
      <div class="px-1">
        <span>絞り込み中: </span>
        <span>{{ eventListStore.filteredEventList.length }}件</span>
      </div>

      <div class="flex gap-2">
        <i class="i-mdi-close size-6" />
      </div>
    </button>
  </div>
</template>

<style scoped>
._container {
  transition: translate 0.3s;
  @starting-style {
    opacity: 0;
    translate: 0 100px;
  }
}
</style>
