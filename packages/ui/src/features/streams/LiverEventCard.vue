<doc lang="md">
配信イベントのカード表示。サムネイル、タレント情報、配信状態を1枚のカードで表現する。

## 状態表示

- 配信中（赤）、配信予定（黒）、配信済み（灰）で色分け
- 新着イベント、ブックマーク、通知のバッジ表示
- コラボメンバーのアイコン一覧

## インタラクション

- クリックで詳細ポップオーバーを開く
- ホイールクリックでYouTubeを直接開く
- 右クリックでタレントをフォーカス検索
- マルチセレクトモード対応
</doc>

<script setup lang="ts">
import { getThumbnail, hhss } from "@liver-streams/core";
import type { LiverEvent } from "@liver-streams/core";
import { computed, toRaw, toRefs } from "vue";
import { getAffiliationLogo } from "../../shared/services";
import { useHoverStore } from "../../shared/stores/hoverStore";
import { useMultiSelectStore } from "../../shared/stores/multiSelectStore";
import { useSearchStore } from "../../shared/stores/searchStore";
import { useLiverEvent } from "./useLiverEvent";

const props = defineProps<{
  liverEvent: LiverEvent;
}>();

const { liverEvent } = toRefs(props);

const hoverStore = useHoverStore();
const multiSelectStore = useMultiSelectStore();
const searchStore = useSearchStore();
const {
  isUpcoming,
  isLive,
  isFinished,
  isHovered,
  liveDurationLabel,
  isNew,
  hasBookmark,
  hasNotify,
} = useLiverEvent(liverEvent);

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

const firstHash = computed(() => {
  return props.liverEvent.hashtagList[0];
});

// hoveredHashSetにhashSetが含まれているか
const hasHoveredHash = computed(() => {
  if (hoverStore.hoveredHashSet.size === 0) return false;

  const hashSet = toRaw(props.liverEvent.hashtagSet);
  return hashSet.intersection(hoverStore.hoveredHashSet).size > 0;
});

// 通常クリック時はpreventしてダイアログを開き、ホイールクリックはリンクを開く
function onClickCard(evt: MouseEvent) {
  evt.preventDefault();

  // マルチセレクトモードの場合はトグルして終了
  if (multiSelectStore.isMultiSelectMode) {
    multiSelectStore.toggleMultiSelectEvent(liverEvent.value.id);
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
    @pointerover="hoverStore.hoverEvent(liverEvent)"
    @pointerleave="hoverStore.unhoverEvent"
  >
    <a :href="liverEvent.url" target="_blank" @click="onClickCard">
      <div
        class="absolute top-0 left-0 z-20 flex -translate-y-1/2 flex-row items-center gap-1 rounded-full px-2 font-bold shadow-sm"
        :class="{
          'bg-red-600 text-white': isLive,
          'bg-gray-300 text-gray-700': isFinished,
          'bg-gray-800 text-white': isUpcoming,
        }"
      >
        <i v-if="liverEvent.isLive" class="i-mdi-play-circle size-5" />
        <span>{{ timeDisplay }}</span>
        <template v-if="liveDurationLabel">
          <span class="font-normal">
            {{ `(${liveDurationLabel.fixed}h)` }}
          </span>
          <div class="flex items-center opacity-50">
            <i v-for="time in liveDurationLabel.count" :key="time" class="i-mdi-clock size-4" />
          </div>
        </template>
      </div>

      <img
        :src="getAffiliationLogo(liverEvent.affiliation)"
        class="absolute bottom-[4px] left-[4px] z-10 w-[clamp(14px,14px+0.4vw,20px)]"
        loading="lazy"
      />

      <div
        class="flex h-[clamp(80px,80px+1vw,108px)] flex-row items-center justify-center gap-1 overflow-hidden rounded-xl rounded-tl-none border-2 shadow-md transition-colors"
        :class="{
          'border-gray-800 bg-white': isUpcoming && !isHovered,
          'border-gray-600 bg-gray-50': isFinished && !isHovered,
          'border-red-600 bg-white': isLive && !isHovered,
          'border-amber-600 bg-amber-200': isHovered,
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
          <div class="line-clamp-2 wrap-anywhere">
            {{ liverEvent.title }}
          </div>
          <div class="absolute bottom-px z-10 flex flex-row">
            <img
              v-for="talent in liverEvent.collaboTalents"
              :key="talent.image"
              :src="talent.image"
              class="aspect-square w-[clamp(12px,12px+0.4vw,20px)] rounded-full outline-1 outline-gray-300 outline-solid hover:outline-2 hover:outline-red-500 hover:outline-solid"
              :title="talent.name"
              loading="lazy"
              @mouseenter="hoverStore.setHoveredTalents(talent.name)"
              @mouseleave="hoverStore.clearHoveredTalents()"
              @contextmenu.prevent="searchStore.setFocusedTalent(talent.name)"
            />
          </div>
        </div>

        <div class="flex aspect-video h-full overflow-hidden max-sm:w-[clamp(140px,30vw,200px)]">
          <img
            :src="getThumbnail(liverEvent.thumbnail, 'mq')"
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
          class="absolute right-0 bottom-0 flex max-w-[50%] flex-row gap-1 overflow-hidden rounded-tl-[10px] p-1 shadow-md"
          :class="{
            'bg-amber-600 text-amber-100': hasHoveredHash,
            'bg-blue-600 text-blue-100': !hasHoveredHash,
          }"
          @contextmenu.prevent="setSearchString(firstHash)"
        >
          <span class="text-xs whitespace-nowrap">#{{ firstHash }}</span>
        </div>

        <div
          v-if="
            multiSelectStore.isMultiSelectMode &&
            multiSelectStore.multiSelectEventIdSet.has(liverEvent.id)
          "
          class="absolute z-10 flex size-full items-center justify-end"
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
