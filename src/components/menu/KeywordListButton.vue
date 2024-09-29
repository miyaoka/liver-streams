<script setup lang="ts">
import { usePopover } from "@/composable/usePopover";
import { useEventListStore } from "@/store/eventListStore";
import { useStorageStore } from "@/store/storageStore";
import { closePopover } from "@/utils/popover";

const eventListStore = useEventListStore();
const storageStore = useStorageStore();

const popover = usePopover();
</script>

<template>
  <button
    class="relative flex size-11 items-center justify-center rounded-full border bg-white shadow-md hover:bg-gray-200"
    @click="popover.showPopover"
    title="popular keywords"
  >
    <i class="i-mdi-hashtag size-8" />
  </button>

  <popover.PopOver
    class="bottom-auto left-auto max-w-[calc(100%-8px)] overflow-visible bg-transparent p-0"
  >
    <div
      class="flex max-h-dvh min-h-[150px] w-[400px] flex-col overflow-hidden rounded-md bg-white outline outline-2"
    >
      <div class="flex h-11 items-center justify-start gap-1 bg-black p-2 text-white">
        <i class="i-mdi-hashtag size-5" />
        <span>keyword/hashtag</span>

        <button
          class="absolute -right-1 z-10 flex size-11 items-center justify-center text-gray-200 hover:text-gray-400 active:text-gray-400"
          @click="closePopover"
        >
          <i class="i-mdi-close size-6" />
        </button>
      </div>
      <div>
        <button
          class="flex h-11 place-items-center gap-1 rounded-full border px-2"
          @click="storageStore.setSearchTerm('')"
        >
          <i class="i-mdi-refresh size-6" />
          clear
        </button>
      </div>
      <div class="flex w-full flex-col gap-2 overflow-auto p-1 pb-10 [scrollbar-width:none]">
        <div class="flex h-11 gap-1 bg-gray-200">
          <i class="i-mdi-hashtag size-6" />
          hashtag
        </div>
        <div class="grid">
          <button
            v-for="item in eventListStore.hashtagList"
            :key="item.value"
            class="hover:bg-gray-200"
            @click="storageStore.setSearchTerm(item.value)"
          >
            <div class="flex items-center gap-2 p-2 text-start">
              <p class="line-clamp-2 flex-1 text-sm [overflow-wrap:anywhere]">
                {{ item.value }}
              </p>
              <div class="w-12 text-center text-sm">
                {{ item.count }}
              </div>
            </div>
          </button>
        </div>
        <hr />
        <div class="flex h-11 gap-1 bg-gray-200">
          <i class="i-mdi-chat-bubble-outline size-6" />
          keyword
        </div>
        <div class="grid">
          <button
            v-for="item in eventListStore.keywordList"
            :key="item.value"
            class="hover:bg-gray-200"
            @click="storageStore.setSearchTerm(item.value)"
          >
            <div class="flex items-center gap-2 p-2 text-start">
              <p class="line-clamp-2 flex-1 text-sm [overflow-wrap:anywhere]">
                {{ item.value }}
              </p>
              <div class="w-12 text-center text-sm">
                {{ item.count }}
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
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
    translate: 0 -50%;
  }
}
</style>
