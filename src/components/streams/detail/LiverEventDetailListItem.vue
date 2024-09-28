<script setup lang="ts">
import LiverEventDetailPopover from "./LiverEventDetailPopover.vue";
import type { LiverEvent } from "@/services/api";
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
    class="bottom-2 top-auto max-w-[calc(100%-16px)] overflow-visible bg-transparent p-0"
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
