<script setup lang="ts">
import channelNames from '@/assets/channelNames.json'
import GroupNode from './GroupNode.vue'
import { useChannelFilterStore } from './channelFilterStore'
import { computed } from 'vue'

const channelFilterStore = useChannelFilterStore()

const filterCount = computed(() => channelFilterStore.map.size)
</script>
<template>
  <button class="fixed p-2 right-4 top-4 z-30 bg-white" popovertarget="filter">filter</button>

  <div
    id="filter"
    popover
    class="fixed transition-all top-4 right-4 left-auto bottom-auto px-8 py-8 rounded-xl outline outline-1 shadow-lg h-4/5 b-10 bg-white"
    :style="{
      scrollbarWidth: 'thin'
    }"
  >
    <div class="flex flex-col items-start gap-8">
      <div class="flex flex-row gap-2 items-center w-full">
        <button
          class="px-2 py-1 bg-slate-200 rounded-lg border border-solid border-slate-500"
          @click="channelFilterStore.reset()"
        >
          reset
        </button>
        <div class="flex-grow">
          {{ filterCount === 0 ? 'no filter' : `filter count: ${filterCount}` }}
        </div>

        <label>
          有効
          <input type="checkbox" v-model="channelFilterStore.enabled" />
        </label>
      </div>
      <GroupNode
        class="-ml-6"
        :class="`${!channelFilterStore.enabled ? 'opacity-50 grayscale' : ''}`"
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
