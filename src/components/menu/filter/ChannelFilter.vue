<script setup lang="ts">
import { computed, ref } from "vue";
import TalentNode from "./TalentNode.vue";
import { talents } from "@/assets/talents";
import { usePopover } from "@/composable/usePopover";
import { useStorageStore } from "@/store/storageStore";
import { getChannelIcon } from "@/utils/icons";

const storageStore = useStorageStore();
const popover = usePopover({
  mountAtOpen: true,
  popoverId: "filter",
});

const filterCount = computed(() => storageStore.talentFilterMap.size);

const groups = [
  { key: "hololive", icon: "hololive_logo" },
  { key: "にじさんじ", icon: "nijisanji_logo" },
] as const;

const selectedGroup = ref<string>("hololive");

const selectedNode = computed(() => {
  return talents.filter((talent) => talent.name === selectedGroup.value);
});
</script>

<template>
  <button
    class="flex size-11 items-center justify-center rounded-full border bg-white shadow-md hover:bg-gray-100"
    popovertarget="filter"
  >
    <i class="i-mdi-menu size-[32px] text-gray-800" />
  </button>

  <popover.PopOver class="left-auto h-screen w-[350px] p-0">
    <div class="flex place-items-center bg-gray-200 px-4 py-2 font-bold">
      <p>フィルター（{{ filterCount }}）</p>

      <button
        class="absolute right-0 z-10 flex size-11 items-center justify-center text-gray-400 hover:text-gray-600"
        @click="popover.hidePopover"
      >
        <i class="i-mdi-close size-8" />
      </button>
    </div>

    <div class="_tabs flex gap-2 p-2">
      <label
        :class="`size-11 grid place-items-center  rounded-lg hover:bg-gray-200
        ${selectedGroup === group.key ? 'bg-gray-200' : ''}`"
        v-for="group in groups"
        :key="group.key"
      >
        <input
          type="radio"
          v-model="selectedGroup"
          :value="group.key"
          name="channel"
          class="sr-only"
        />
        <img
          :src="getChannelIcon(group.icon)"
          alt="icon"
          class="size-[32px] rounded-full bg-white"
        />
      </label>
    </div>

    <div class="-ml-4 flex-1 overflow-y-auto p-2 pb-12 pt-4">
      <TalentNode v-for="talent in selectedNode" :node="talent" :key="talent.name" />
    </div>
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
