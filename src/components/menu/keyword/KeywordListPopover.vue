<script setup lang="ts">
import { computed } from "vue";
import KeywordListPopoverItem from "./KeywordListPopoverItem.vue";
import { getFilteredEventList } from "@/lib/search";
import { useEventListStore } from "@/store/eventListStore";
import { useSearchStore } from "@/store/searchStore";
import { useStorageStore } from "@/store/storageStore";
import { closePopover } from "@/utils/popover";

export interface KeywordItem {
  value: string;
  count: number;
}

const eventListStore = useEventListStore();
const storageStore = useStorageStore();
const searchStore = useSearchStore();

// searchTermsを指定しない状態のリスト
const filteredEventList = computed(() => {
  const list = eventListStore.liverEventList;
  if (!list) return [];
  const searchQuery = searchStore.parsedSearchInput;
  return getFilteredEventList({
    liverEventList: list,
    filterMap: storageStore.talentFilterMap,
    searchQuery: {
      ...searchQuery,
      wordList: [],
      hashtagList: [],
      options: {},
    },
  });
});

const keywordList = computed(() => {
  const map: Record<string, number> = {};
  filteredEventList.value.forEach((event) => {
    event.keywordList.forEach((keyword) => {
      if (keyword in map) {
        map[keyword]++;
      } else {
        map[keyword] = 1;
      }
    });
  });
  return mapToList(map);
});

const hashtagList = computed(() => {
  const map: Record<string, number> = {};
  filteredEventList.value.forEach((event) => {
    event.hashList.forEach((hashtag) => {
      if (hashtag in map) {
        map[hashtag]++;
      } else {
        map[hashtag] = 1;
      }
    });
  });
  return mapToList(map);
});

function mapToList(map: Record<string, number>, minCount = 2): KeywordItem[] {
  const sortedList = Object.entries(map)
    .flatMap(([value, count]) => {
      if (count < minCount) return [];
      return { value, count };
    })
    .sort((a, b) => b.count - a.count);
  return sortedList;
}
</script>

<template>
  <div
    class="flex max-h-[500px] min-h-[150px] w-[350px] flex-col overflow-hidden rounded-md border-2 border-gray-800 bg-white"
  >
    <div class="flex h-11 shrink-0 items-center justify-start gap-1 bg-black p-2 text-white">
      <i class="i-mdi-hashtag size-5" />
      <span>トレンド</span>

      <button
        class="absolute -right-1 z-10 flex size-11 items-center justify-center text-gray-200 hover:text-gray-400 active:text-gray-400"
        @click="closePopover"
      >
        <i class="i-mdi-close size-6" />
      </button>
    </div>

    <div class="grid gap-2 overflow-y-scroll [scrollbar-width:none]">
      <header
        class="sticky top-0 flex h-10 place-items-center gap-1 border-black bg-green-100 px-2 font-bold shadow-md"
      >
        <i class="i-mdi-chat-outline size-4" />
        keyword
      </header>
      <KeywordListPopoverItem :itemList="keywordList" />

      <header
        class="sticky top-0 flex h-10 place-items-center gap-1 border-black bg-yellow-100 px-2 font-bold shadow-md"
      >
        <i class="i-mdi-hashtag size-4" />
        hashtag
      </header>
      <KeywordListPopoverItem :itemList="hashtagList" />
    </div>
  </div>
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
