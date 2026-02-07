<doc lang="md">
新着イベント一覧のポップオーバーを開くボタン。ポップオーバーを閉じてから追加されたイベント数をバッジで表示する。
</doc>

<script setup lang="ts">
import { computed, ref } from "vue";
import { usePopover } from "../../shared/composables/usePopover";
import { useEventListStore } from "../../store/eventListStore";
import NewArrivalsPopover from "./NewArrivalsPopover.vue";

const eventListStore = useEventListStore();

const lastCloseTime = ref(0);
const popover = usePopover({
  onHide: () => {
    lastCloseTime.value = Date.now();
  },
});

const unreadCount = computed(
  () => eventListStore.addedEventList.filter((item) => item.addedTime > lastCloseTime.value).length,
);
</script>

<template>
  <button
    class="relative flex size-11 items-center justify-center rounded-full border bg-white shadow-md hover:bg-gray-200"
    @click="popover.togglePopover"
    title="recently added events"
  >
    <i
      class="size-8"
      :class="{
        'i-mdi-sparkles': popover.isShow.value,
        'i-mdi-sparkles-outline': !popover.isShow.value,
      }"
    />
    <p
      v-if="unreadCount > 0"
      class="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-xl bg-red-700 px-1 text-xs text-white"
    >
      {{ unreadCount }}
    </p>
  </button>

  <popover.PopOver
    class="top-auto right-1 bottom-20 left-auto max-w-[calc(100%-8px)] justify-center overflow-visible bg-transparent p-0"
  >
    <NewArrivalsPopover :lastCloseTime="lastCloseTime" />
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
