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
    class="relative p-1 flex flex-col items-center bg-white rounded shadow-md"
    @click="storageStore.toggleLiveOnly"
  >
    <p v-if="storageStore.isLiveOnly" class="bg-white text-red-500 font-bold">live</p>
    <i :class="`i-mdi-radio-tower w-8 h-8 ${storageStore.isLiveOnly ? 'bg-red-500' : ''}`" />
    <p
      :class="`absolute ${hasLiveEvents ? 'bg-red-700' : 'bg-gray-700'} text-white text-xs rounded-xl px-1 -right-2 -top-2 min-w-5 h-5 flex items-center justify-center`"
    >
      {{ eventListStore.onLiveEventList.length }}
    </p>
  </button>
</template>
