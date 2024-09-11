<script setup lang="ts">
import { computed, ref } from "vue";
import LiverEventDialog from "./LiverEventDialog.vue";
import type { LiverEvent } from "@/api";
import hololive_logo from "@/assets/icons/hololive_logo.png";
import nijisanji_logo from "@/assets/icons/nijisanji_logo.png";
import { useDateStore } from "@/store/dateStore";
import { useTalentStore } from "@/store/talentStore";
import { hhss } from "@/utils/dateFormat";
import { getThumnail } from "@/utils/youtube";

const props = defineProps<{
  liverEvent: LiverEvent;
}>();

const talentStore = useTalentStore();
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
      return dateStore.date.getTime() - props.liverEvent.startAt.getTime();
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
    strs.push("- LIVE");
  }
  // 終了時刻
  if (isFinished.value) {
    strs.push("- 配信済み");
  }
  // 経過時間
  if (elapsedTime.value) {
    strs.push(`(${elapsedTime.value}hr)`);
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
  const now = Date.now();
  const startTime = props.liverEvent.startAt.getTime();
  // 現在時刻を過ぎていなければ開始前
  if (now < startTime) return false;
  // ホロライブの場合
  if (props.liverEvent.affilication === "hololive") {
    // startTimeの秒数が0以外あれば配信開始済み
    if (props.liverEvent.startAt.getSeconds() !== 0) return true;

    // 秒数が0の場合、1時間経過していたら終了と見なす
    if (now - startTime > 60 * 60 * 1000) return true;
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
  const mergedNames = [...talentStore.hoveredTalents, ...talentNames];
  // 重複を削除
  const uniqueNames = new Set(mergedNames);

  // 重複があればhover中
  return uniqueNames.size !== mergedNames.length;
});

function hoverEvent(liverEvent: LiverEvent) {
  const names = [liverEvent.talent.name, ...liverEvent.collaboTalents.map((t) => t.name)];
  talentStore.setHoveredTalents(names);
}

// 通常クリック時はpreventしてダイアログを開き、ホイールクリックはリンクを開く
function onClickCard(evt: MouseEvent) {
  evt.preventDefault();
  dialogComponent.value?.open();
}
</script>
<template>
  <div
    class="relative group scroll-m-16"
    :data-event-time="props.liverEvent.startAt.getTime()"
    @mouseover="hoverEvent(liverEvent)"
    @mouseleave="talentStore.clearHoveredTalents()"
  >
    <a ref="button" :href="liverEvent.url" target="_blank" @click="onClickCard">
      <div
        :class="`absolute z-10 left-0 ${isFinished ? 'text-gray-700 bg-gray-300' : liverEvent.isLive ? 'text-white bg-red-500' : 'text-blue-500 bg-white'} font-bold px-2 -top-1 -translate-y-1/2 shadow rounded-full`"
      >
        <span>{{ timeDisplay }}</span>
      </div>
      <img
        :src="affilicationLogoMap[liverEvent.affilication]"
        class="absolute z-10 bottom-[4px] left-[4px] w-[clamp(14px,14px+0.4vw,20px)]"
        loading="lazy"
      />

      <div
        class="flex flex-row justify-center items-center gap-1 h-[clamp(80px,80px+1vw,108px)] bg-white rounded-[10px] overflow-hidden shadow-md pl-1"
        :class="{
          isLive: liverEvent.isLive,
          isFinished: isFinished,
          isHovered: isHovered,
        }"
      >
        <img
          :src="liverEvent.talent.image"
          class="rounded-full w-[clamp(36px,36px+1vw,60px)] group-hover:scale-110"
          loading="lazy"
          @contextmenu.prevent="talentStore.setFocusedTalent(liverEvent.talent.name)"
        />

        <div
          class="flex flex-col h-full justify-center relative items-start pb-2 flex-1 text-[clamp(11px,11px+0.25vw,14px)] tracking-tighter"
        >
          <h3 class="font-bold">{{ liverEvent.talent.name }}</h3>
          <div class="line-clamp-2">{{ liverEvent.title }}</div>
          <div class="absolute bottom-1 flex flex-row z-10">
            <img
              v-for="talent in liverEvent.collaboTalents"
              :key="talent.image"
              :src="talent.image"
              class="rounded-full w-[clamp(12px,12px+0.4vw,20px)] outline outline-orange-400 outline-1 hover:outline hover:outline-red-500 hover:outline-2"
              :title="talent.name"
              loading="lazy"
              @mouseenter="talentStore.setHoveredTalents(talent.name)"
              @mouseleave="talentStore.clearHoveredTalents()"
              @contextmenu.prevent="talentStore.setFocusedTalent(talent.name)"
            />
          </div>
        </div>

        <img
          :src="getThumnail(liverEvent.thumbnail, 'mq')"
          class="aspect-video object-cover h-full max-sm:w-[clamp(140px,30vw,200px)] group-hover:scale-110"
          loading="lazy"
        />
      </div>
    </a>
    <LiverEventDialog ref="dialogComponent" :liverEvent="liverEvent" />
  </div>
</template>

<style scoped>
.isLive {
  @apply outline outline-[3px] -outline-offset-[3px] outline-red-600;
}
.isHovered {
  @apply bg-pink-100;
}
.isFinished:not(.isHovered) {
  @apply bg-slate-50;
}

dialog {
  &::backdrop {
    animation: backdropFadeIn 0.4s forwards;
    background-color: rgba(0, 0, 0, 0.4);
  }
  &[open] {
    animation: fadeIn 0.2s forwards;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    scale: 0.8;
  }
}
@keyframes backdropFadeIn {
  from {
    opacity: 0;
  }
}
</style>
