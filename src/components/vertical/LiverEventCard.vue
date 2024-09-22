<script setup lang="ts">
import { computed, ref } from "vue";
import LiverEventDialog from "./LiverEventDialog.vue";
import type { LiverEvent } from "@/services/api";
import hololive_logo from "@/assets/icons/hololive_logo.png";
import nijisanji_logo from "@/assets/icons/nijisanji_logo.png";
import { getThumnail } from "@/lib/youtube";
import { useDateStore } from "@/store/dateStore";
import { useFocusStore } from "@/store/focusStore";
import { hhss } from "@/utils/dateFormat";

const props = defineProps<{
  liverEvent: LiverEvent;
}>();

const focusStore = useFocusStore();
const dateStore = useDateStore();
const dialogComponent = ref<InstanceType<typeof LiverEventDialog> | null>(null);

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

  return time > 0 ? (time / oneHour).toFixed(1) : null;
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
  return hashSet.value.intersection(focusStore.hoveredHashSet).size > 0;
});

// listからSetを作成
// 大文字・小文字を区別せずマッチするように小文字に変換してからSetに変換
const hashSet = computed(() => new Set(props.liverEvent.hashList.map((h) => h.toLowerCase())));

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
  dialogComponent.value?.open();
}
</script>
<template>
  <div
    class="relative group"
    data-id="liver-event-card"
    @mouseover="hoverEvent(liverEvent)"
    @mouseleave="unhoverEvent"
  >
    <a :href="liverEvent.url" target="_blank" @click="onClickCard">
      <div
        :class="`absolute z-10 left-0 flex flex-row items-center gap-1 ${isFinished ? 'text-gray-700 bg-gray-300' : liverEvent.isLive ? 'text-white bg-red-500' : 'text-blue-500 bg-white'} font-bold px-2 -top-1 -translate-y-1/2 shadow rounded-full`"
      >
        <i v-if="liverEvent.isLive" class="i-mdi-play-circle w-5 h-5" />
        <span>{{ timeDisplay }}</span>
        <span v-if="elapsedTime" class="font-normal">{{ `(${elapsedTime}hr)` }}</span>
      </div>
      <img
        :src="affilicationLogoMap[liverEvent.affilication]"
        class="absolute z-10 bottom-[4px] left-[4px] w-[clamp(14px,14px+0.4vw,20px)]"
        loading="lazy"
      />

      <div
        class="flex flex-row justify-center items-center gap-1 h-[clamp(80px,80px+1vw,108px)] bg-white rounded-[10px] overflow-hidden shadow-md transition-colors"
        :class="{
          isFinished: isFinished,
          isHovered: isHovered,
        }"
      >
        <img
          :src="liverEvent.talent.image"
          class="rounded-full w-[clamp(36px,36px+1vw,60px)] bg-white ml-2 group-hover:scale-110 transition-transform"
          loading="lazy"
          @contextmenu.prevent="focusStore.setFocusedTalent(liverEvent.talent.name)"
        />

        <div
          class="flex flex-col h-full justify-center relative items-start pb-2 flex-1 text-[clamp(11px,11px+0.25vw,14px)] tracking-tighter"
        >
          <h3 class="font-bold line-clamp-1">{{ liverEvent.talent.name }}</h3>
          <div class="title line-clamp-2">
            {{ liverEvent.title }}
          </div>
          <div class="absolute bottom-1 flex flex-row z-10">
            <img
              v-for="talent in liverEvent.collaboTalents"
              :key="talent.image"
              :src="talent.image"
              class="rounded-full w-[clamp(12px,12px+0.4vw,20px)] aspect-square outline outline-orange-400 outline-1 hover:outline hover:outline-red-500 hover:outline-2"
              :title="talent.name"
              loading="lazy"
              @mouseenter="focusStore.setHoveredTalents(talent.name)"
              @mouseleave="focusStore.clearHoveredTalents()"
              @contextmenu.prevent="focusStore.setFocusedTalent(talent.name)"
            />
          </div>
        </div>

        <div class="h-full aspect-video max-sm:w-[clamp(140px,30vw,200px)] overflow-hidden flex">
          <img
            :src="getThumnail(liverEvent.thumbnail, 'mq')"
            class="object-cover w-full h-full group-hover:scale-110 transition-transform"
            loading="lazy"
          />
        </div>

        <div
          class="pointer-events-none absolute w-full h-full rounded-[10px]"
          :class="{
            isLive: liverEvent.isLive,
            isHoveredOutline: isHovered,
          }"
        ></div>

        <div
          v-if="firstHash"
          class="absolute bottom-0 right-0 flex flex-row gap-1 p-1 rounded-tl-[10px] shadow-md max-w-[50%] overflow-hidden"
          :class="`${hasHoveredHash ? 'bg-orange-600 text-orange-100' : 'bg-blue-600 text-blue-100'}`"
        >
          <span class="text-xs whitespace-nowrap">{{ firstHash }}</span>
        </div>
      </div>
    </a>

    <LiverEventDialog ref="dialogComponent" :liverEvent="liverEvent" />
  </div>
</template>

<style scoped>
.title {
  overflow-wrap: anywhere;
}

.isLive {
  @apply outline outline-[3px] -outline-offset-[3px] outline-red-600 !important;
}
.isHovered {
  @apply bg-amber-200;
}
.isHoveredOutline {
  @apply outline outline-[2px] -outline-offset-[2px] outline-amber-600;
}
.isFinished:not(.isHovered) {
  @apply bg-slate-50;
}
</style>
