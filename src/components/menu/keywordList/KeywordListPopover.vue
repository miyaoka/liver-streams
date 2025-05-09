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
  const searchQuery = searchStore.searchQuery;
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
  const keywordLists = filteredEventList.value.map((event) => event.keywordList);
  return createCountList(keywordLists);
});

const hashtagList = computed(() => {
  const hashtagLists = filteredEventList.value.map((event) => event.hashtagList);
  return createCountList(hashtagLists).map((item) => {
    return { value: `#${item.value}`, count: item.count };
  });
});

const wholeList = computed(() => {
  const list = [...keywordList.value, ...hashtagList.value];
  return list.sort((a, b) => b.count - a.count);
});

// 大文字小文字を区別せずにカウントし、一番多いものをキーにする
function createCountList(eventList: string[][]): KeywordItem[] {
  const keywordMap: Map<string, Map<string, number>> = new Map();
  eventList.forEach((keywordList) => {
    keywordList.forEach((keyword) => {
      // 小文字化したキーでカウント
      const lowerKeyword = keyword.toLowerCase();
      const countMap = keywordMap.get(lowerKeyword);
      if (countMap) {
        countMap.set(keyword, (countMap.get(keyword) ?? 0) + 1);
      } else {
        keywordMap.set(lowerKeyword, new Map([[keyword, 1]]));
      }
    });
  });

  const resultList: KeywordItem[] = [];
  keywordMap.forEach((countMap, _lowerItem) => {
    let totalCount = 0;
    let key = "";
    let maxCount = 0;

    // キーワードごとのカウントを合計し、最大カウントを持つキーワードをキーにする
    countMap.forEach((count, keyword) => {
      totalCount += count;
      if (count > maxCount) {
        maxCount = count;
        key = keyword;
      }
    });

    resultList.push({ value: key, count: totalCount });
  });

  return resultList;
}
</script>

<template>
  <div
    class="flex max-h-[min(500px,calc(100dvh-5rem))] min-h-[150px] w-[350px] flex-col overflow-hidden rounded-md border-2 border-gray-800 bg-white"
  >
    <div class="flex h-11 shrink-0 items-center justify-start gap-1 bg-black p-2 text-white">
      <i class="i-icon-park-solid-topic size-5" />
      <span>トレンド</span>

      <button
        class="absolute -right-1 z-10 flex size-11 items-center justify-center text-gray-200 hover:text-gray-400 active:text-gray-400"
        @click="closePopover"
      >
        <i class="i-mdi-close size-6" />
      </button>
    </div>

    <KeywordListPopoverItem :itemList="wholeList" />
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
