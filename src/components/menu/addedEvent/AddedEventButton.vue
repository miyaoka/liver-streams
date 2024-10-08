<script setup lang="ts">
import { computed, ref } from "vue";
import AddedEventPopover from "./AddedEventPopover.vue";
import { usePopover } from "@/composable/usePopover";
import { useEventListStore } from "@/store/eventListStore";

const eventListStore = useEventListStore();

let lastCloseTime = ref(0);
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
    <i :class="`${popover.isShow.value ? 'i-mdi-sparkles' : 'i-mdi-sparkles-outline'} size-8`" />
    <p
      v-if="unreadCount > 0"
      :class="`absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-xl bg-red-700 px-1 text-xs text-white`"
    >
      {{ unreadCount }}
    </p>
  </button>

  <popover.PopOver
    class="bottom-20 left-auto right-1 top-auto max-w-[calc(100%-8px)] justify-center overflow-visible bg-transparent p-0"
  >
    <AddedEventPopover :lastCloseTime="lastCloseTime" />
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
