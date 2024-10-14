<script setup lang="ts">
import { computed } from "vue";
import { useEventListStore } from "@/store/eventListStore";
import { useSearchStore } from "@/store/searchStore";

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
    <i
      class="size-8"
      :class="{
        'i-eva-radio-fill text-red-700': searchStore.isLiveOnly,
        'i-eva-radio-outline': !searchStore.isLiveOnly,
      }"
    />
    <p
      class="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-xl bg-red-700 px-1 text-xs text-white"
      :class="{
        'bg-red-700': hasLiveEvents,
        'bg-gray-700': !hasLiveEvents,
      }"
    >
      {{ eventListStore.onLiveEventList.length }}
    </p>
  </button>
</template>
