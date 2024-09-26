<script setup lang="ts">
import { computed } from "vue";
import LiverEventDialog from "./LiverEventDialog.vue";
import type { LiverEvent } from "@/services/api";
import hololive_logo from "@/assets/icons/hololive_logo.png";
import nijisanji_logo from "@/assets/icons/nijisanji_logo.png";
import { usePopover } from "@/composable/usePopover";
import { getThumnail } from "@/lib/youtube";
import { useDateStore } from "@/store/dateStore";
import { useEventListStore } from "@/store/eventListStore";
import { useFocusStore } from "@/store/focusStore";
import { hhss } from "@/utils/dateFormat";

const props = defineProps<{
  liverEvent: LiverEvent;
}>();

const focusStore = useFocusStore();
const dateStore = useDateStore();
const popover = usePopover({
  mountAtOpen: true,
  popoverId: props.liverEvent.id,
});
const eventListStore = useEventListStore();

const affilicationLogoMap = {
  nijisanji: nijisanji_logo,
  hololive: hololive_logo,
};

const oneHour = 60 * 60 * 1000;
const elapsedTime = computed(() => {
  const { isLive, endAt } = props.liverEvent;

  const time = (() => {
    // 終了時間があれば終了時間から開始時間を引く
    if (endAt) {
      return endAt.getTime() - props.liverEvent.startAt.getTime();
    }
    // ライブ中なら現在時刻から開始時間を引く
    if (isLive) {
      return dateStore.currentTime - props.liverEvent.startAt.getTime();
    }
    return 0;
  })();

  if (time === 0) return null;

  const hour = time / oneHour;
  return {
    fixed: hour.toFixed(1),
    count: Math.max(1, Math.round(hour)),
  };
});

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

// 配信終了判定
const isFinished = computed(() => {
  // 終了時刻が設定されているか（にじさんじのみ）
  if (props.liverEvent.endAt) return true;
  // 配信中か
  if (props.liverEvent.isLive) return false;

  // 配信していない場合
  const now = dateStore.currentTime;
  const startTime = props.liverEvent.startAt.getTime();
  // 現在時刻を過ぎていなければ開始前
  if (now < startTime) return false;
  // ホロライブの場合
  if (props.liverEvent.affilication === "hololive") {
    // startTimeの秒数が0以外あれば配信開始済み
    if (props.liverEvent.startAt.getSeconds() !== 0) return true;

    // 秒数が0の場合、1時間経過していたら終了と見なす
    if (now - startTime > oneHour) return true;
  }
  // それ以外の場合：未終了
  return false;
});

const isHovered = computed(() => {
  const talentNames = [
    props.liverEvent.talent.name,
    ...props.liverEvent.collaboTalents.map((t) => t.name),
  ];

  // eventのタレントとhoverのタレントをマージ
  const mergedNames = [...focusStore.hoveredTalents, ...talentNames];
  // 重複を削除
  const uniqueNames = new Set(mergedNames);

  // 重複があればhover中
  return uniqueNames.size !== mergedNames.length;
});

const firstHash = computed(() => {
  return props.liverEvent.hashList[0];
});

// hoveredHashSetにhashSetが含まれているか
const hasHoveredHash = computed(() => {
  if (focusStore.hoveredHashSet.size === 0) return false;
  // todo: vue-tscで型エラーになるのでいったん無視
  // TS2339: Property 'intersection' does not exist on type 'Set<string>'
  // @ts-ignore
  return hashSet.value.intersection(focusStore.hoveredHashSet).size > 0;
});

// listからSetを作成
// 大文字・小文字を区別せずマッチするように小文字に変換してからSetに変換
const hashSet = computed(() => new Set(props.liverEvent.hashList.map((h) => h.toLowerCase())));

const isNew = computed(() => {
  return eventListStore.addedEventIdSet.has(props.liverEvent.id);
});

function hoverEvent(liverEvent: LiverEvent) {
  const names = [liverEvent.talent.name, ...liverEvent.collaboTalents.map((t) => t.name)];
  focusStore.setHoveredTalents(names);
  focusStore.setHoveredHashSet(hashSet.value);
}

function unhoverEvent() {
  focusStore.clearHoveredTalents();
  focusStore.clearHoveredHashSet();
}

// 通常クリック時はpreventしてダイアログを開き、ホイールクリックはリンクを開く
function onClickCard(evt: MouseEvent) {
  evt.preventDefault();
  popover.showPopover();
}
</script>
<template>
  <div
    class="group relative scroll-mt-16"
    data-id="liver-event-card"
    :data-event-id="`${liverEvent.id}`"
    @mouseover="hoverEvent(liverEvent)"
    @mouseleave="unhoverEvent"
  >
    <a :href="liverEvent.url" target="_blank" @click="onClickCard">
      <div
        :class="`absolute left-0 z-10 flex flex-row items-center gap-1 ${isFinished ? 'bg-slate-300 text-slate-700' : liverEvent.isLive ? 'bg-red-600 text-white' : 'bg-slate-800 text-white'} -top-0 -translate-y-1/2 rounded-full px-2 font-bold shadow`"
      >
        <i v-if="liverEvent.isLive" class="i-mdi-play-circle size-5" />
        <span>{{ timeDisplay }}</span>
        <template v-if="elapsedTime">
          <span class="font-normal">
            {{ `(${elapsedTime.fixed}h)` }}
          </span>
          <div class="flex items-center opacity-50">
            <i v-for="time in elapsedTime.count" :key="time" :class="`i-mdi-clock h-4 w-4`" />
          </div>
        </template>
      </div>

      <div
        v-if="isNew"
        class="absolute bottom-full right-0 z-10 flex flex-row items-center justify-center gap-1 bg-black/70 px-1"
      >
        <p class="text-xs text-white">new</p>

        <i class="i-mdi-creation size-4 bg-yellow-300" />
      </div>

      <img
        :src="affilicationLogoMap[liverEvent.affilication]"
        class="absolute bottom-[4px] left-[4px] z-10 w-[clamp(14px,14px+0.4vw,20px)]"
        loading="lazy"
      />

      <div
        class="flex h-[clamp(80px,80px+1vw,108px)] flex-row items-center justify-center gap-1 overflow-hidden rounded-xl rounded-tl-none border-2 border-slate-800 bg-white shadow-md transition-colors"
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
          @contextmenu.prevent="focusStore.setFocusedTalent(liverEvent.talent.name)"
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
              class="aspect-square w-[clamp(12px,12px+0.4vw,20px)] rounded-full outline outline-1 outline-slate-300 hover:outline hover:outline-2 hover:outline-red-500"
              :title="talent.name"
              loading="lazy"
              @mouseenter="focusStore.setHoveredTalents(talent.name)"
              @mouseleave="focusStore.clearHoveredTalents()"
              @contextmenu.prevent="focusStore.setFocusedTalent(talent.name)"
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

        <div
          v-if="firstHash"
          class="absolute bottom-0 right-0 flex max-w-[50%] flex-row gap-1 overflow-hidden rounded-tl-[10px] p-1 shadow-md"
          :class="`${hasHoveredHash ? 'bg-amber-600 text-amber-100' : 'bg-blue-600 text-blue-100'}`"
        >
          <span class="whitespace-nowrap text-xs">{{ firstHash }}</span>
        </div>
      </div>
    </a>
  </div>
  <popover.PopOver
    class="bottom-2 top-auto max-w-[calc(100%-16px)] overflow-visible bg-transparent p-0"
  >
    <LiverEventDialog :liverEvent="liverEvent" />
  </popover.PopOver>
</template>

<style scoped>
.isHovered {
  @apply border-amber-600 bg-amber-200;
}
.isLive {
  @apply border-red-600;
}
.isFinished:not(.isHovered) {
  @apply border-slate-600 bg-slate-50;
}

[popover] {
  &::backdrop {
    background-color: rgba(0, 0, 0, 0.4);
  }
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
