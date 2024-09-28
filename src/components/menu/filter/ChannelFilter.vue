<script setup lang="ts">
import { computed } from "vue";
import TalentNode from "./TalentNode.vue";
import { talents } from "@/assets/talents";
import { usePopover } from "@/composable/usePopover";
import { useStorageStore } from "@/store/storageStore";

const storageStore = useStorageStore();
const popover = usePopover({
  mountAtOpen: true,
  popoverId: "filter",
});

const filterCount = computed(() => storageStore.talentFilterMap.size);
</script>

<template>
  <button
    class="flex size-11 items-center justify-center rounded-full border bg-white shadow-md hover:bg-gray-100"
    popovertarget="filter"
  >
    <i class="i-mdi-menu size-[32px] text-gray-800" />
  </button>

  <popover.PopOver class="left-auto max-h-screen w-[400px]">
    <button
      class="absolute right-0 z-10 flex size-11 items-center justify-center text-gray-400 hover:text-gray-600"
      @click="popover.hidePopover"
    >
      <i class="i-mdi-close size-8" />
    </button>

    <TalentNode v-for="talent in talents" :node="talent" :key="talent.name" />
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
    translate: 50% 0;
  }
}
</style>
