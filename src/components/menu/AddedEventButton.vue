<script setup lang="ts">
import { computed, ref } from "vue";
import AddedEventCard from "./AddedEventCard.vue";
import { usePopover } from "@/composable/usePopover";
import { useEventListStore } from "@/store/eventListStore";
import { closePopover } from "@/utils/popover";

const eventListStore = useEventListStore();

let lastOpenTime = ref(0);
const popover = usePopover({
  mountAtOpen: true,
  onHide: () => {
    lastOpenTime.value = Date.now();
  },
});

const eventCount = computed(() => eventListStore.filteredAddedEventList.length);
const unreadCount = computed(
  () =>
    eventListStore.filteredAddedEventList.filter((item) => item.addedTime > lastOpenTime.value)
      .length,
);

function showPopover() {
  popover.showPopover();
}
</script>

<template>
  <button
    class="relative flex size-11 items-center justify-center rounded-full border bg-white shadow-lg hover:bg-gray-200"
    @click="showPopover"
  >
    <i class="i-mdi-new-box size-8" />
    <p
      v-if="unreadCount > 0"
      :class="`absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-xl bg-red-700 px-1 text-xs text-white`"
    >
      {{ unreadCount }}
    </p>
  </button>

  <popover.PopOver
    class="bottom-2 left-auto right-1 top-auto max-w-[calc(100%-8px)] justify-center overflow-visible bg-transparent p-0"
  >
    <div
      class="flex max-h-[500px] min-h-[150px] w-[400px] flex-col overflow-hidden rounded-md bg-white outline outline-2"
    >
      <div class="flex items-center justify-start bg-black p-2 text-white">
        最近追加されたイベント ({{ eventCount }})

        <button
          class="absolute -right-1 z-10 flex size-11 items-center justify-center text-gray-200 hover:text-gray-400 active:text-gray-400"
          @click="closePopover"
        >
          <i class="i-mdi-close size-5" />
        </button>
      </div>
      <div class="flex w-full flex-col gap-2 overflow-auto p-1 pb-10 [scrollbar-width:none]">
        <div v-if="eventCount === 0" class="p-2">
          ブラウザを開いてから追加されたイベントがここに載ります
        </div>

        <!-- 逆順表示 -->
        <div v-else class="flex flex-col-reverse">
          <AddedEventCard
            v-for="{ liverEvent, addedTime } in eventListStore.filteredAddedEventList"
            :key="liverEvent.id"
            :addedTime="addedTime"
            :lastOpenTime="lastOpenTime"
            :liverEvent="liverEvent"
          />
        </div>
      </div>
    </div>
  </popover.PopOver>
</template>

<style scoped>
[popover] {
  &:popover-open {
    animation: fadeIn 0.2s forwards;
  }
}

@keyframes fadeIn {
  from {
    translate: 0 50%;
  }
}
</style>
