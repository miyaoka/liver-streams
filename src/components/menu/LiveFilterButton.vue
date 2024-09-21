<script setup lang="ts">
import { useEventListStore } from "@/store/eventListStore";
import { useStorageStore } from "@/store/storageStore";

const storageStore = useStorageStore();
const eventListStore = useEventListStore();
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
      class="absolute bg-red-700 text-white text-xs rounded-xl px-1 -right-2 -top-2 min-w-5 h-5 flex items-center justify-center"
    >
      {{ eventListStore.liveEventList.length }}
    </p>
  </button>
</template>
