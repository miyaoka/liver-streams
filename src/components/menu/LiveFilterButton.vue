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
    class="relative flex flex-col items-center rounded bg-white p-1 shadow-md"
    @click="storageStore.toggleLiveOnly"
  >
    <i :class="`i-mdi-radio-tower h-8 w-8 ${storageStore.isLiveOnly ? 'bg-red-600' : ''}`" />
    <p
      :class="`absolute ${hasLiveEvents ? 'bg-red-600' : 'bg-gray-700'} -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-xl px-1 text-xs text-white`"
    >
      {{ eventListStore.onLiveEventList.length }}
    </p>
    <p
      v-if="storageStore.isLiveOnly"
      class="absolute inset-0 top-auto rounded-b bg-red-600 text-xs font-bold text-white"
    >
      live
    </p>
  </button>
</template>
