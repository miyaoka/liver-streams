<script setup lang="ts">
import type { LiverEvent } from "@liver-streams/core";
import LiverEventDetailPopover from "./LiverEventDetailPopover.vue";
import { usePopover } from "@/composable/usePopover";

const props = defineProps<{
  liverEvent: LiverEvent;
}>();

const popover = usePopover({
  popoverId: props.liverEvent.id,
});
</script>

<template>
  <popover.PopOver
    class="inset-x-0 top-auto bottom-2 mx-auto max-w-[calc(100%-16px)] overflow-visible bg-transparent p-0"
  >
    <LiverEventDetailPopover :liverEvent="liverEvent" />
  </popover.PopOver>
</template>

<style scoped>
[popover] {
  &::backdrop {
    background-color: rgba(0, 0, 0, 0.4);
  }
  &:popover-open {
    animation: fadeIn 0.2s ease-in-out forwards;
  }
}

@keyframes fadeIn {
  from {
    translate: 0 50%;
  }
}
</style>
