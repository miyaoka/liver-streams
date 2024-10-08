<script setup lang="ts">
import { computed, toRaw, toRefs } from "vue";
import { useLiverEvent } from "./useLiverEvent";
import type { LiverEvent } from "@/services/api";
import { getThumnail } from "@/lib/youtube";
import { useFocusStore } from "@/store/focusStore";
import { useSearchStore } from "@/store/searchStore";
import { hhss } from "@/utils/dateFormat";
import { getChannelIcon } from "@/utils/icons";

const props = defineProps<{
  liverEvent: LiverEvent;
}>();

const { liverEvent } = toRefs(props);

const focusStore = useFocusStore();
const searchStore = useSearchStore();
const { isFinished, liveDurationLabel, isNew, hasBookmark, hasNotify } = useLiverEvent(liverEvent);

const timeDisplay = computed(() => {
  const { isLive, startAt } = props.liverEvent;
  const strs: string[] = [];

  // 開始時刻
  strs.push(hhss(startAt));
  // ライブ中
  if (isLive) {
    strs.push("-");
  }
  // 終了時刻
  if (isFinished.value) {
    strs.push("- 配信済み");
  }

  return strs.join(" ");
});

const isHovered = computed(() => {
  if (!focusStore.hoveredTalent) return false;

  // 自身がホバー中のタレントか
  if (focusStore.hoveredTalent === props.liverEvent.talent.name) return true;

  // ホバー中のタレントがコラボタレントに含まれているか
  const collaboTalentSet = toRaw(props.liverEvent.collaboTalentSet);
  if (collaboTalentSet.has(focusStore.hoveredTalent)) return true;

  // ホバー中のコラボタレントにタレントが含まれているか
  return focusStore.hoveredCollaboTalentSet.has(props.liverEvent.talent.name);
});

const firstHash = computed(() => {
  return props.liverEvent.hashtagList[0];
});

// hoveredHashSetにhashSetが含まれているか
const hasHoveredHash = computed(() => {
  if (focusStore.hoveredHashSet.size === 0) return false;

  const hashSet = toRaw(props.liverEvent.hashtagSet);
  return hashSet.intersection(focusStore.hoveredHashSet).size > 0;
});

// 通常クリック時はpreventしてダイアログを開き、ホイールクリックはリンクを開く
function onClickCard(evt: MouseEvent) {
  evt.preventDefault();

  // マルチセレクトモードの場合はトグルして終了
  if (focusStore.isMultiSelectMode) {
    focusStore.toggleMultiSelectEvent(liverEvent.value.id);
    return;
  }

  // idからpopover要素を取得
  const popover = document.getElementById(props.liverEvent.id);
  if (!popover) return;
  popover.togglePopover();
}

function setSearchString(str: string) {
  const hashtag = `#${str}`;
  // 同じものなら検索を解除
  if (searchStore.searchString === hashtag) {
    searchStore.setSearchString("");
    return;
  }
  searchStore.setSearchString(hashtag);
}
</script>
<template>
  <div
    class="group relative scroll-mt-16"
    data-id="liver-event-card"
    :data-event-id="`${liverEvent.id}`"
    @pointerover="focusStore.hoverEvent(liverEvent)"
    @pointerleave="focusStore.unhoverEvent"
  >
    <a :href="liverEvent.url" target="_blank" @click="onClickCard">
      <div
        :class="`absolute left-0 z-10 flex flex-row items-center gap-1 ${isFinished ? 'bg-gray-300 text-gray-700' : liverEvent.isLive ? 'bg-red-600 text-white' : 'bg-gray-800 text-white'} -top-0 -translate-y-1/2 rounded-full px-2 font-bold shadow`"
      >
        <i v-if="liverEvent.isLive" class="i-mdi-play-circle size-5" />
        <span>{{ timeDisplay }}</span>
        <template v-if="liveDurationLabel">
          <span class="font-normal">
            {{ `(${liveDurationLabel.fixed}h)` }}
          </span>
          <div class="flex items-center opacity-50">
            <i v-for="time in liveDurationLabel.count" :key="time" :class="`i-mdi-clock h-4 w-4`" />
          </div>
        </template>
      </div>

      <img
        :src="getChannelIcon(`${liverEvent.affilication}_logo`)"
        class="absolute bottom-[4px] left-[4px] z-10 w-[clamp(14px,14px+0.4vw,20px)]"
        loading="lazy"
      />

      <div
        class="flex h-[clamp(80px,80px+1vw,108px)] flex-row items-center justify-center gap-1 overflow-hidden rounded-xl rounded-tl-none border-2 border-gray-800 bg-white shadow-md transition-colors"
        :class="{
          isFinished: isFinished,
          isHovered: isHovered,
          isLive: liverEvent.isLive,
        }"
      >
        <img
          :src="liverEvent.talent.image"
          class="ml-1 w-[clamp(36px,36px+1vw,60px)] rounded-full bg-white transition-transform group-hover:scale-110"
          loading="lazy"
          @contextmenu.prevent="searchStore.setFocusedTalent(liverEvent.talent.name)"
        />

        <div
          class="relative flex h-full flex-1 flex-col items-start justify-center pb-2 text-[clamp(11px,11px+0.25vw,14px)] tracking-tighter"
        >
          <h3 class="line-clamp-1 font-bold">{{ liverEvent.talent.name }}</h3>
          <div class="line-clamp-2 [overflow-wrap:anywhere]">
            {{ liverEvent.title }}
          </div>
          <div class="absolute bottom-px z-10 flex flex-row">
            <img
              v-for="talent in liverEvent.collaboTalents"
              :key="talent.image"
              :src="talent.image"
              class="aspect-square w-[clamp(12px,12px+0.4vw,20px)] rounded-full outline outline-1 outline-gray-300 hover:outline hover:outline-2 hover:outline-red-500"
              :title="talent.name"
              loading="lazy"
              @mouseenter="focusStore.setHoveredTalents(talent.name)"
              @mouseleave="focusStore.clearHoveredTalents()"
              @contextmenu.prevent="searchStore.setFocusedTalent(talent.name)"
            />
          </div>
        </div>

        <div class="flex aspect-video h-full overflow-hidden max-sm:w-[clamp(140px,30vw,200px)]">
          <img
            :src="getThumnail(liverEvent.thumbnail, 'mq')"
            class="size-full object-cover transition-transform group-hover:scale-110"
            loading="lazy"
          />
        </div>

        <div class="absolute -top-4 right-0 z-10 flex">
          <div
            v-if="isNew"
            class="grid size-10 place-items-center rounded-full border-2 border-purple-800 bg-white shadow-md"
            title="new"
          >
            <i class="i-mdi-sparkles size-7 text-purple-600" />
          </div>
          <template v-if="hasBookmark">
            <div
              v-if="hasNotify"
              class="grid size-10 place-items-center rounded-full border-2 border-yellow-800 bg-white shadow-md"
              title="bookmark"
            >
              <i class="i-mdi-bell size-7 text-yellow-600" />
            </div>
            <div
              v-else
              class="grid size-10 place-items-center rounded-full border-2 border-green-800 bg-white shadow-md"
              title="bookmark"
            >
              <i class="i-mdi-bookmark size-7 text-green-600" />
            </div>
          </template>
        </div>

        <div
          v-if="firstHash"
          class="absolute bottom-0 right-0 flex max-w-[50%] flex-row gap-1 overflow-hidden rounded-tl-[10px] p-1 shadow-md"
          :class="`${hasHoveredHash ? 'bg-amber-600 text-amber-100' : 'bg-blue-600 text-blue-100'}`"
          @contextmenu.prevent="setSearchString(firstHash)"
        >
          <span class="whitespace-nowrap text-xs">#{{ firstHash }}</span>
        </div>

        <div
          v-if="focusStore.isMultiSelectMode && focusStore.multiSelectEventIdSet.has(liverEvent.id)"
          class="absolute flex size-full items-center justify-end"
        >
          <div class="absolute inset-0 rounded-xl bg-green-500/30" />

          <div class="absolute right-2 z-10 flex rounded-full bg-white">
            <i class="i-mdi-checkbox-marked-circle size-12 text-green-600" />
          </div>
        </div>
      </div>
    </a>
  </div>
</template>

<style scoped>
.isHovered {
  @apply border-amber-600 bg-amber-200;
}
.isLive {
  @apply border-red-600;
}
.isFinished:not(.isHovered) {
  @apply border-gray-600 bg-gray-50;
}
</style>
