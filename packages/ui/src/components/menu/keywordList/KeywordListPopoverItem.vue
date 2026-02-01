<script setup lang="ts">
import { useSearchStore } from "../../../store/searchStore";
import type { KeywordItem } from "./KeywordListPopover.vue";

defineProps<{
  itemList: KeywordItem[];
}>();

const searchStore = useSearchStore();

function setSearchString(str: string) {
  // 空白を含むならダブルクォーテーションで囲む
  const formattedStr = str.includes(" ") ? `"${str}"` : str;
  // 同じものなら検索を解除
  if (searchStore.searchString === formattedStr) {
    searchStore.setSearchString("");
    return;
  }
  searchStore.setSearchString(formattedStr);
}
</script>

<template>
  <div class="grid gap-1 overflow-y-scroll pt-2 pb-6 [scrollbar-width:none]">
    <button
      v-for="item in itemList"
      :key="item.value"
      class="py-1 hover:bg-gray-100"
      @click="setSearchString(item.value)"
    >
      <div class="flex items-center gap-2 px-3 text-start">
        <p class="line-clamp-2 flex-1 wrap-anywhere">
          {{ item.value }}
        </p>
        <div class="w-12 text-center">
          {{ item.count }}
        </div>
      </div>
    </button>
  </div>
</template>
