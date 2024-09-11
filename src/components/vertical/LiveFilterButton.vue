<script setup lang="ts">
import { useChannelFilterStore } from "../filter/channelFilterStore";

const filterStore = useChannelFilterStore();
function toggleLiveFilter() {
  filterStore.isLiveOnly = !filterStore.isLiveOnly;
}
</script>

<template>
  <button
    title="show only live events"
    class="relative p-1 flex flex-col items-center bg-white rounded shadow-md"
    @click="toggleLiveFilter"
  >
    <p v-if="filterStore.isLiveOnly" class="bg-white text-red-500 font-bold">live</p>
    <i :class="`i-mdi-radio-tower w-8 h-8 ${filterStore.isLiveOnly ? 'bg-red-500' : ''}`" />
  </button>
</template>
