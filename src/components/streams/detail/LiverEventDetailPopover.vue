<script setup lang="ts">
import { computed, toRef } from "vue";
import { useLiverEvent } from "../useLiverEvent";
import type { LiverEvent } from "@/services/api";
import { parseSegment } from "@/lib/text";
import { getThumnail } from "@/lib/youtube";
import { useBookmarkStore } from "@/store/bookmarkStore";
import { useFocusStore } from "@/store/focusStore";
import { useSearchStore } from "@/store/searchStore";
import { useStorageStore } from "@/store/storageStore";
import { fullDateFormatter } from "@/utils/dateFormat";
import { closePopover } from "@/utils/popover";

const props = defineProps<{
  liverEvent: LiverEvent;
}>();

const { isFinished, elapsedTime, isNew, hasBookmark, hasNotify } = useLiverEvent(
  toRef(props.liverEvent),
);

const bookmarkStore = useBookmarkStore();

const focusStore = useFocusStore();
const storageStore = useStorageStore();
const searchStore = useSearchStore();

const fullDate = computed(() => {
  return fullDateFormatter.format(props.liverEvent.startAt);
});

// セグメント化したタイトル
const segmentList = computed(() => {
  const { title, keywordList, hashtagList: hashList } = props.liverEvent;
  return parseSegment(title, keywordList, hashList);
});

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
  <div
    class="w-[480px] max-w-full overflow-hidden rounded-lg border border-gray-500 bg-white pb-2 shadow-xl"
  >
    <div class="flex items-center bg-gray-800 px-4 py-2 text-gray-200">
      <div class="font-bold">
        {{ fullDate }}
      </div>
      <button
        class="absolute right-0 grid size-11 place-items-center text-gray-400 hover:text-gray-200"
        @click="closePopover"
      >
        <i class="i-mdi-close size-5" />
      </button>
    </div>

    <a :href="liverEvent.url" target="_blank">
      <img
        :src="getThumnail(liverEvent.thumbnail, 'sd')"
        class="_thumb [@starting-style:opacity-0] aspect-video w-[480px] bg-gray-800 object-cover p-0 transition-colors"
        loading="lazy"
      />
    </a>

    <div class="relative flex flex-col gap-2 px-6 py-4 max-sm:p-3">
      <div class="text-lg font-bold">
        <template v-for="(segment, i) in segmentList" :key="i">
          <span
            v-if="segment.type === 'hashtag'"
            class="cursor-pointer text-blue-500 hover:underline"
            @click="setSearchString(segment.value)"
          >
            {{ segment.value }}
          </span>
          <span
            v-else-if="segment.type === 'keyword'"
            class="cursor-pointer text-blue-500 hover:underline"
            @click="setSearchString(segment.value)"
          >
            {{ segment.value }}
          </span>
          <span v-else>
            {{ segment.value }}
          </span>
        </template>
      </div>

      <div class="flex flex-row items-center gap-2">
        <button
          class="size-[70px] overflow-hidden rounded-full border hover:outline hover:outline-2 hover:outline-red-500"
          @mouseover="focusStore.setHoveredTalents(liverEvent.talent.name)"
          @mouseleave="focusStore.clearHoveredTalents()"
          @click.prevent="searchStore.setFocusedTalent(liverEvent.talent.name)"
          @contextmenu.prevent="searchStore.setFocusedTalent(liverEvent.talent.name)"
        >
          <img :src="liverEvent.talent.image" class="size-full" loading="lazy" />
        </button>
        <div class="flex-1">
          <div class="text-base font-bold">
            {{ liverEvent.talent.name }}
          </div>
          <div class="flex flex-row flex-wrap">
            <button
              class="w-[40px] overflow-hidden rounded-full hover:outline hover:outline-2 hover:outline-red-500 max-sm:w-[30px]"
              v-for="talent in liverEvent.collaboTalents"
              :key="talent.image"
              :title="talent.name"
              @mouseenter="focusStore.setHoveredTalents(talent.name)"
              @mouseleave="focusStore.clearHoveredTalents()"
              @click.prevent="searchStore.setFocusedTalent(talent.name)"
              @contextmenu.prevent="searchStore.setFocusedTalent(talent.name)"
            >
              <img class="size-full" :src="talent.image" loading="lazy" />
            </button>
          </div>
        </div>
        <div class="flex flex-col place-items-center">
          <button
            class="group/fav grid size-11 place-items-center"
            @click="bookmarkStore.toggleBookmarkEvent(liverEvent.id)"
            title="add bookmark"
          >
            <div
              :class="`size-10 place-items-center bg-white rounded-full grid  border-2 group-hover/fav:bg-gray-100 ${hasBookmark ? 'border-green-800' : 'border-gray-400'} `"
            >
              <i
                :class="`size-7 ${hasBookmark ? 'i-mdi-bookmark text-green-600' : 'i-mdi-bookmark-outline  text-gray-400'}`"
              />
            </div>
          </button>
          <button
            class="group/fav grid size-11 place-items-center"
            @click="bookmarkStore.toggleNotifyEvent(liverEvent.id)"
            title="add notification"
          >
            <div
              :class="`size-10 place-items-center bg-white rounded-full grid  border-2 border-gray-400 group-hover/fav:bg-gray-100
              ${hasNotify ? 'border-yellow-800' : 'border-gray-400'}
              `"
            >
              <i
                :class="`size-7 ${hasNotify ? 'i-mdi-bell text-yellow-600' : 'i-mdi-bell-outline text-gray-400'}`"
              />
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
._thumb {
  transition: opacity 1s;
  @starting-style {
    opacity: 0;
  }
}
</style>
