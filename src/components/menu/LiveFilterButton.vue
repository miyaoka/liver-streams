<script setup lang="ts">
import { computed } from "vue";
import { useEventListStore } from "@/store/eventListStore";
import { useStorageStore } from "@/store/storageStore";

const storageStore = useStorageStore();
const eventListStore = useEventListStore();
const hasLiveEvents = computed(() => eventListStore.onLiveEventList.length > 0);
</script>

<template>
  <button
    title="show only live events"
    class="relative flex h-11 w-11 flex-col items-center justify-center rounded-full border bg-white shadow-md hover:bg-gray-200"
    @click="storageStore.toggleLiveOnly"
  >
    <i :class="`i-mdi-radio-tower h-8 w-8 ${storageStore.isLiveOnly ? 'bg-red-700' : ''}`" />
    <p
      :class="`absolute ${hasLiveEvents ? 'bg-red-700' : 'bg-gray-700'} -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-xl px-1 text-xs text-white`"
    >
      {{ eventListStore.onLiveEventList.length }}
    </p>
    <p
      v-if="storageStore.isLiveOnly"
      class="absolute top-full -translate-y-1 bg-red-700 px-2 text-xs font-bold text-red-100"
    >
      live
    </p>
  </button>
</template>
