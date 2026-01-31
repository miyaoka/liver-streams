<script setup lang="ts">
import { computed } from "vue";
import AddedEventListItem from "./AddedEventListItem.vue";
import { useEventListStore } from "@/store/eventListStore";
import { closePopover } from "@/utils/popover";

defineProps<{
  lastCloseTime: number;
}>();

const eventListStore = useEventListStore();
const eventCount = computed(() => eventListStore.addedEventList.length);
</script>

<template>
  <div
    class="flex max-h-[min(500px,calc(100dvh-5rem))] min-h-[150px] w-[400px] flex-col overflow-hidden rounded-md bg-white outline-2 outline-solid"
  >
    <div class="flex h-11 items-center justify-start gap-1 bg-black p-2 text-white">
      <i class="i-mdi-sparkles size-5" />
      <span> 最近追加されたイベント ({{ eventCount }}) </span>

      <button
        class="absolute -right-1 z-10 flex size-11 items-center justify-center text-gray-200 hover:text-gray-400 active:text-gray-400"
        @click="closePopover"
      >
        <i class="i-mdi-close size-6" />
      </button>
    </div>
    <div class="flex w-full flex-col gap-2 overflow-auto p-1 pb-10 [scrollbar-width:none]">
      <div v-if="eventCount === 0" class="p-2">
        ブラウザを開いてから追加されたイベントがここに載ります
      </div>

      <!-- 逆順表示 -->
      <div v-else class="flex flex-col-reverse">
        <AddedEventListItem
          v-for="{ liverEvent, addedTime } in eventListStore.addedEventList"
          :key="liverEvent.id"
          :addedTime="addedTime"
          :lastCloseTime="lastCloseTime"
          :liverEvent="liverEvent"
        />
      </div>
    </div>
  </div>
</template>
