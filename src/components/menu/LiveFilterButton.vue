<script setup lang="ts">
import { computed } from "vue";
import { useEventListStore } from "@/store/eventListStore";
import { useSearchStore } from "@/store/searchStore";
import { useStorageStore } from "@/store/storageStore";

const storageStore = useStorageStore();
const searchStore = useSearchStore();
const eventListStore = useEventListStore();
const hasLiveEvents = computed(() => eventListStore.onLiveEventList.length > 0);
</script>

<template>
  <button
    title="show only live events"
    class="relative flex size-11 flex-col items-center justify-center rounded-full border bg-white shadow-md hover:bg-gray-200"
    @click="searchStore.toggleLiveOnly"
  >
    <i :class="`i-lucide-radio size-8 ${searchStore.isLiveOnly ? 'text-red-700' : ''}`" />
    <p
      :class="`absolute ${hasLiveEvents ? 'bg-red-700' : 'bg-gray-700'} -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-xl px-1 text-xs text-white`"
    >
      {{ eventListStore.onLiveEventList.length }}
    </p>
  </button>
</template>
