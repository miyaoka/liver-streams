<script setup lang="ts">
import { useStorageStore } from "@/store/storageStore";

const storageStore = useStorageStore();
</script>

<template>
  <button
    title="show only live events"
    class="relative p-1 flex flex-col items-center bg-white rounded shadow-md"
    @click="storageStore.toggleLiveOnly"
  >
    <p v-if="storageStore.isLiveOnly" class="bg-white text-red-500 font-bold">live</p>
    <i :class="`i-mdi-radio-tower w-8 h-8 ${storageStore.isLiveOnly ? 'bg-red-500' : ''}`" />
  </button>
</template>
