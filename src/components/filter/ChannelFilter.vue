<script setup lang="ts">
import channelNames from '@/assets/channelNames.json'
import GroupNode from './GroupNode.vue'
import { useChannelFilterStore } from './channelFilterStore'

const channelFilterStore = useChannelFilterStore()
</script>
<template>
  <button class="fixed p-2 right-4 top-4 z-30 bg-white" popovertarget="filter">filter</button>

  <div
    id="filter"
    popover
    class="fixed transition-all top-4 right-4 left-auto bottom-auto px-16 py-8 outline outline-1 shadow-lg h-4/5 b-10 bg-white"
    :style="{
      scrollbarWidth: 'thin'
    }"
  >
    <div class="flex flex-col items-start gap-4">
      <button
        class="px-2 py-1 bg-slate-200 rounded-lg border border-solid border-black"
        @click="channelFilterStore.reset()"
      >
        reset
      </button>
      <GroupNode class="-ml-6" :group="channelNames" />
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
