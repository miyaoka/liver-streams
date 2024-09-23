<script setup lang="ts">
import { computed, ref } from "vue";
import AddedEventCard from "./AddedEventCard.vue";
import { usePopover } from "@/composable/usePopover";
import { useEventListStore } from "@/store/eventListStore";

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
    class="relative flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-lg"
    @click="showPopover"
  >
    <i class="i-mdi-new-box h-8 w-8" />
    <p
      v-if="unreadCount > 0"
      :class="`absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-xl bg-red-700 px-1 text-xs text-white`"
    >
      {{ unreadCount }}
    </p>
  </button>

  <popover.PopOver class="left-auto top-auto max-h-[500px] w-[400px]">
    <div class="flex flex-col gap-2 rounded-lg bg-white p-2 pb-10 shadow-lg">
      <div class="bg-black text-white">最近追加されたイベント ({{ eventCount }})</div>
      <div v-if="eventCount === 0">なし</div>

      <!-- 逆順表示 -->
      <div v-else class="flex flex-col-reverse">
        <AddedEventCard
          v-for="{ liverEvent, addedTime } in eventListStore.filteredAddedEventList"
          :key="liverEvent.url"
          :addedTime="addedTime"
          :lastOpenTime="lastOpenTime"
          :liverEvent="liverEvent"
        />
      </div>
    </div>
  </popover.PopOver>
</template>
