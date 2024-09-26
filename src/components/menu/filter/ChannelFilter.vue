<script setup lang="ts">
import { computed } from "vue";
import GroupNode from "./GroupNode.vue";
import channelNames from "@/assets/channelNames.json";
import { useStorageStore } from "@/store/storageStore";

const storageStore = useStorageStore();

const filterCount = computed(() => storageStore.talentFilterMap.size);
</script>
<template>
  <button
    class="flex size-11 items-center justify-center rounded-full border bg-white shadow-md hover:bg-gray-100"
    popovertarget="filter"
  >
    <i class="i-mdi-menu size-[32px] text-gray-800" />
  </button>

  <div
    id="filter"
    popover
    class="fixed bottom-auto left-auto right-4 top-4 h-4/5 rounded-xl bg-white p-8 shadow-lg outline outline-1 transition-all"
    :style="{
      scrollbarWidth: 'thin',
    }"
  >
    <div class="flex flex-col items-start gap-8">
      <div class="flex w-full flex-row items-center gap-2">
        <button
          class="rounded-lg border border-solid border-slate-500 bg-slate-200 px-2 py-1"
          @click="storageStore.resetTalentFilter()"
        >
          reset
        </button>
        <div class="grow">
          {{ filterCount === 0 ? "no filter" : `filter count: ${filterCount}` }}
        </div>

        <label>
          フィルタ適用
          <input type="checkbox" v-model="storageStore.talentFilterEnabled" />
        </label>
      </div>
      <GroupNode
        class="-ml-6"
        :class="`${!storageStore.talentFilterEnabled ? 'opacity-50 grayscale' : ''}`"
        :group="channelNames"
      />
    </div>
  </div>
</template>

<style>
[popover] {
  &:popover-open {
    @starting-style {
      opacity: 0;
    }
  }
}
</style>
