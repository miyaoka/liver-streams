<script setup lang="ts">
import { computed, ref } from "vue";
import AddedEventCard from "./AddedEventCard.vue";
import { usePopover } from "@/composable/usePopover";
import { useEventListStore } from "@/store/eventListStore";

const eventListStore = useEventListStore();

let lastOpenTime = ref(0);
const popover = usePopover({
  mountAtOpen: true,
  onShow: () => {
    console.log("show");
  },
  onHide: () => {
    console.log("hide");
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
    class="relative rounded-lg shadow-lg h-10 w-10 flex items-center justify-center bg-white"
    @click="showPopover"
  >
    <i class="i-mdi-new-box h-8 w-8" />
    <p
      v-if="unreadCount > 0"
      :class="`absolute bg-red-700 text-white text-xs rounded-xl px-1 -right-2 -top-2 min-w-5 h-5 flex items-center justify-center`"
    >
      {{ unreadCount }}
    </p>
  </button>

  <popover.PopOver class="top-auto left-auto max-h-[500px] w-[400px]">
    <div class="bg-white rounded-lg shadow-lg p-2 flex flex-col gap-2 pb-10">
      <div class="sticky bg-black text-white">
        最近追加されたイベント ({{ eventCount }})
        {{ lastOpenTime }}
      </div>
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
