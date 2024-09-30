<script setup lang="ts">
import { computed } from "vue";
import { getFilteredEventList } from "@/lib/search";
import { useEventListStore } from "@/store/eventListStore";
import { useSearchStore } from "@/store/searchStore";
import { useStorageStore } from "@/store/storageStore";
import { closePopover } from "@/utils/popover";

interface Item {
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
  const { options } = searchStore.parsedSearchInput;
  return getFilteredEventList({
    liverEventList: list,
    filterMap: storageStore.talentFilterMap,
    searchQuery: {
      wordList: [],
      options,
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

function mapToList(map: Record<string, number>): Item[] {
  const sortedList = Object.entries(map)
    .flatMap(([value, count]) => {
      if (count < 2) return [];
      return { value, count };
    })
    .sort((a, b) => b.count - a.count);
  return sortedList;
}

function setSearchTerm(term: string) {
  // 空白を含むならダブルクォーテーションで囲む
  const formattedTerm = term.includes(" ") ? `"${term}"` : term;
  searchStore.setSearchTerm(formattedTerm);
}
function clearSearchTerm() {
  searchStore.setSearchTerm("");
}
</script>

<template>
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
        @click="clearSearchTerm"
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
          v-for="item in hashtagList"
          :key="item.value"
          class="hover:bg-gray-200"
          @click="setSearchTerm(item.value)"
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
          v-for="item in keywordList"
          :key="item.value"
          class="hover:bg-gray-200"
          @click="setSearchTerm(item.value)"
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
