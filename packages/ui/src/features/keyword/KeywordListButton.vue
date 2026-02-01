<doc lang="md">
トレンドキーワード一覧のポップオーバーを開くボタン。
</doc>

<script setup lang="ts">
import { usePopover } from "../../shared/composables/usePopover";
import KeywordListPopover from "./KeywordListPopover.vue";

const popover = usePopover();
</script>

<template>
  <button
    class="relative flex size-11 items-center justify-center rounded-full border bg-white shadow-md hover:bg-gray-200"
    @click="popover.togglePopover"
    title="popular keywords"
  >
    <i
      class="size-8"
      :class="{
        'i-icon-park-solid-topic': popover.isShow.value,
        'i-icon-park-outline-topic': !popover.isShow.value,
      }"
    />
  </button>

  <popover.PopOver
    class="top-auto right-1 bottom-20 left-auto max-w-[calc(100%-8px)] overflow-visible bg-transparent p-0"
  >
    <KeywordListPopover />
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
