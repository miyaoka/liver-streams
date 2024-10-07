<script setup lang="ts">
import { useEventListStore } from "@/store/eventListStore";
import { useFocusStore } from "@/store/focusStore";
import { useSearchStore } from "@/store/searchStore";

const searchStore = useSearchStore();
const eventListStore = useEventListStore();
const focusStore = useFocusStore();

function close() {
  searchStore.setSearchString("");
}

function selectAll() {
  focusStore.isMultiSelectMode = true;
  focusStore.multiSelectEventIdSet.clear();
  eventListStore.filteredEventList.forEach((event) => {
    focusStore.multiSelectEventIdSet.add(event.id);
  });
}
</script>

<template>
  <div
    v-if="searchStore.hasQuery"
    class="_container fixed inset-0 bottom-8 top-auto z-10 m-auto flex w-fit items-center justify-center gap-2 rounded-full bg-black p-2 text-sm text-white shadow-md max-md:bottom-20"
  >
    <div class="px-1">
      <span>絞り込み中:</span>
      <span> {{ eventListStore.filteredEventList.length }}件 </span>
    </div>

    <div class="flex gap-2">
      <button
        class="flex h-11 items-center justify-center gap-1 rounded-full bg-green-600/90 px-2 py-1 hover:bg-green-700/90"
        @click="selectAll"
      >
        <i class="i-mdi-check-all size-6" />
        全選択
      </button>
      <button
        class="flex h-11 items-center justify-center gap-1 rounded-full bg-red-600/90 px-2 py-1 hover:bg-red-700/90"
        @click="close"
      >
        <i class="i-mdi-close size-6" />
        絞り込み解除
      </button>
    </div>
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
