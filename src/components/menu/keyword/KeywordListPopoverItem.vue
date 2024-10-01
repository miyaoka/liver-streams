<script setup lang="ts">
import type { KeywordItem } from "./KeywordListPopover.vue";
import { useSearchStore } from "@/store/searchStore";

defineProps<{
  itemList: KeywordItem[];
}>();

const searchStore = useSearchStore();

function setSearchTerm(term: string) {
  // 空白を含むならダブルクォーテーションで囲む
  const formattedTerm = term.includes(" ") ? `"${term}"` : term;
  // 同じものなら検索を解除
  if (searchStore.searchTerm === formattedTerm) {
    searchStore.setSearchTerm("");
    return;
  }
  searchStore.setSearchTerm(formattedTerm);
}
</script>

<template>
  <div class="grid pb-10">
    <button
      v-for="item in itemList"
      :key="item.value"
      class="py-1 hover:bg-gray-100"
      @click="setSearchTerm(item.value)"
    >
      <div class="flex items-center gap-2 px-3 text-start">
        <p class="line-clamp-2 flex-1 [overflow-wrap:anywhere]">
          {{ item.value }}
        </p>
        <div class="w-12 text-center">
          {{ item.count }}
        </div>
      </div>
    </button>
  </div>
</template>
