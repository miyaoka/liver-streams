<script setup lang="ts">
import { computed } from "vue";
import { useEventListStore } from "@/store/eventListStore";
import { fullDateFormatter } from "@/utils/dateFormat";

const eventListStore = useEventListStore();

const addedEvent = computed(() => {
  const eventMap = eventListStore.liverEventMap;
  return eventListStore.addedEventList
    .flatMap(({ url, addedTime }) => {
      const liverEvent = eventMap.get(url);
      if (!liverEvent) return [];

      return {
        liverEvent,
        addedTime,
      };
    })
    .reverse();
});
</script>

<template>
  <button
    class="relative rounded-lg shadow-lg h-10 w-10 flex items-center justify-center bg-white"
    @click="console.log('Added event')"
    popovertarget="addedEvent"
  >
    <i class="i-mdi-new-box h-8 w-8" />
    <p
      v-if="addedEvent.length > 0"
      :class="`absolute bg-red-700 text-white text-xs rounded-xl px-1 -right-2 -top-2 min-w-5 h-5 flex items-center justify-center`"
    >
      {{ addedEvent.length }}
    </p>
  </button>
  <div id="addedEvent" popover class="top-auto left-auto max-h-[500px] w-[400px]">
    <div class="bg-white rounded-lg shadow-lg p-2 flex flex-col gap-2">
      <div class="sticky bg-black text-white">新着</div>
      <div
        v-for="{ liverEvent, addedTime } in addedEvent"
        :key="liverEvent.url"
        class="flex flex-row gap-2 items-center"
      >
        <img :src="liverEvent.talent.image" loading="lazy" class="h-8 w-8 rounded-full" />
        <p class="text-sm flex-1 line-clamp-2">{{ liverEvent.title }}</p>
        <p class="text-xs w-20">{{ fullDateFormatter.format(addedTime) }}</p>
      </div>
    </div>
  </div>
</template>
