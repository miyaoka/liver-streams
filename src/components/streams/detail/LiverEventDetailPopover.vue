<script setup lang="ts">
import { computed, toRef } from "vue";
import { useLiverEvent } from "../useLiverEvent";
import type { LiverEvent } from "@/services/api";
import { usePopover } from "@/composable/usePopover";
import { parseSegment } from "@/lib/text";
import { getThumbnail } from "@/lib/youtube";
import { useBookmarkStore } from "@/store/bookmarkStore";
import { useFocusStore } from "@/store/focusStore";
import { useNotificationStore } from "@/store/notificationStore";
import { useSearchStore } from "@/store/searchStore";
import { fullDateFormatter } from "@/utils/dateFormat";
import { closePopover } from "@/utils/popover";

const props = defineProps<{
  liverEvent: LiverEvent;
}>();

const bookmarkStore = useBookmarkStore();
const focusStore = useFocusStore();
const searchStore = useSearchStore();
const notificationStore = useNotificationStore();

const { hasBookmark, hasNotify } = useLiverEvent(toRef(props.liverEvent));
const permissionPopover = usePopover();

const fullDate = computed(() => {
  return fullDateFormatter.format(props.liverEvent.startAt);
});

// セグメント化したタイトル
const segmentList = computed(() => {
  const { title, keywordList, hashtagList } = props.liverEvent;
  return parseSegment(title, keywordList, hashtagList);
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

// 通知機能が使えるか
const canSetNotify = computed(() => {
  if (!notificationStore.isSupported) return false;
  return true;
  // 開始時間前なら通知可能
  // return beforeStartTime.value && !isFinished.value;
});

async function onClickNotify(id: string) {
  if (!notificationStore.isSupported) return;

  // 通知許可済みなら通知をトグル
  if (notificationStore.permissionGranted) {
    bookmarkStore.toggleNotifyEvent(id);
    return;
  }

  // 通知許可ポップオーバーを表示
  permissionPopover.showPopover();
  // 通知許可を求める
  const permission = await notificationStore.ensurePermissions();
  if (!permission) return;

  // 許可されたらポップオーバーを閉じて通知をトグル
  permissionPopover.hidePopover();
  bookmarkStore.toggleNotifyEvent(id);
}
</script>

<template>
  <div
    class="w-[480px] max-w-full overflow-hidden rounded-lg border border-gray-500 bg-white pb-2 shadow-xl"
  >
    <div class="flex h-11 items-center bg-gray-800 px-4 text-gray-200">
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
        :src="getThumbnail(liverEvent.thumbnail, 'sd')"
        class="_thumb aspect-video w-[480px] bg-gray-800 object-cover p-0 transition-colors"
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
          class="size-[70px] overflow-hidden rounded-full border hover:outline-2 hover:outline-red-500 hover:outline-solid"
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
              class="w-[40px] overflow-hidden rounded-full hover:outline-2 hover:outline-red-500 hover:outline-solid max-sm:w-[30px]"
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
              class="grid size-10 place-items-center rounded-full border-2 bg-white group-hover/fav:bg-gray-100"
              :class="{
                'border-green-800': hasBookmark,
                'border-gray-400': !hasBookmark,
              }"
            >
              <i
                class="size-7"
                :class="{
                  'i-mdi-bookmark text-green-600': hasBookmark,
                  'i-mdi-bookmark-outline text-gray-400': !hasBookmark,
                }"
              />
            </div>
          </button>
          <button
            v-if="canSetNotify"
            class="group/fav grid size-11 place-items-center"
            @click="onClickNotify(liverEvent.id)"
            title="add notification"
          >
            <div
              class="grid size-10 place-items-center rounded-full border-2 border-gray-400 bg-white group-hover/fav:bg-gray-100"
              :class="{
                'border-yellow-800': hasNotify,
                'border-gray-400': !hasNotify,
              }"
            >
              <i
                class="size-7"
                :class="{
                  'i-mdi-bell text-yellow-600': hasNotify,
                  'i-mdi-bell-outline text-gray-400': !hasNotify,
                }"
              />
            </div>
          </button>
        </div>
      </div>
    </div>
    <permissionPopover.PopOver class="top-auto bottom-4 overflow-visible bg-transparent p-0">
      <button
        class="rounded-full bg-yellow-400 p-4 text-sm shadow-md"
        @click="permissionPopover.hidePopover()"
      >
        通知を許可してください
      </button>
    </permissionPopover.PopOver>
  </div>
</template>

<style scoped>
._thumb {
  transition: opacity 1s;
  @starting-style {
    opacity: 0;
  }
}

[popover] {
  &:popover-open {
    animation: fadeIn 0.2s ease-in-out forwards;
  }
}

@keyframes fadeIn {
  from {
    translate: 0 50%;
  }
}
</style>
