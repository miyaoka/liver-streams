<script setup lang="ts">
import { computed, ref } from "vue";
import type { LiverEvent } from "@/api";
import hololive_logo from "@/assets/icons/hololive_logo.png";
import nijisanji_logo from "@/assets/icons/nijisanji_logo.png";
import { useDateStore } from "@/store/dateStore";
import { useTalentStore } from "@/store/talentStore";
import { dateFormatter, hhss } from "@/utils/dateFormat";

const props = defineProps<{
  liverEvent: LiverEvent;
}>();

const talentStore = useTalentStore();
const dateStore = useDateStore();
const dialogEl = ref<HTMLDialogElement | null>(null);

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
    if (startTime % 1000 !== 0) return true;

    // 秒数が0で1時間経過していたら終了と見なす
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

// 通常クリック時はダイアログを開き、ホイールクリックでリンクを開く
function onClickCard(evt: MouseEvent) {
  evt.preventDefault();
  if (!dialogEl.value) return;
  dialogEl.value.showModal();
}
// ダイアログ外をクリックしたら閉じる
function onClickDialog(evt: MouseEvent) {
  if (!dialogEl.value) return;
  // ターゲットがダイアログならダイアログ外判定
  if (evt.target !== dialogEl.value) return;
  evt.preventDefault();
  dialogEl.value.close();
}

function hoverEvent(liverEvent: LiverEvent | null) {
  if (!liverEvent) {
    talentStore.hoveredTalents = [];
    return;
  }
  const names = [liverEvent.talent.name, ...liverEvent.collaboTalents.map((t) => t.name)];
  talentStore.hoveredTalents = names;
}

function hoverTalent(name: string | null) {
  talentStore.hoveredTalents = name ? [name] : [];
}

// サムネイルの画質を上げる
function getThumnail(url: string, quolity: string) {
  // , 'sd'画像がyoutubeの場合、mq(320x180)のurlになっているのでsd(640x480)に置換する
  const groups = url.match(/^(?<base>.+\/)(?<quolity>.+default)(?<filename>(_live)?\..+)$/)?.groups;
  if (!groups) return url;

  const { base, filename } = groups;
  return `${base}${quolity}default${filename}`;
}

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
  const { isLive, startAt, endAt } = props.liverEvent;
  const strs: string[] = [];

  // 開始時刻
  strs.push(hhss(startAt));
  // ライブ中
  if (isLive) {
    strs.push("-");
  }
  // 終了時刻
  if (isFinished.value) {
    strs.push(`- ${endAt ? hhss(endAt) : "終了"}`);
  }
  // 経過時間
  if (elapsedTime.value) {
    strs.push(`(${elapsedTime.value}hr)`);
  }
  return strs.join(" ");
});
</script>
<template>
  <div
    class="relative hover:scale-105 hover:z-10 transition-all"
    @mouseover="hoverEvent(liverEvent)"
    @mouseleave="hoverTalent(null)"
  >
    <div
      :class="`absolute  ${isFinished ? 'text-gray-700 bg-gray-300' : liverEvent.isLive ? 'text-white bg-red-500' : 'text-blue-500 bg-white'} font-bold px-2 -top-1 -translate-y-1/2 shadow rounded-full`"
    >
      <span>{{ timeDisplay }}</span>
    </div>
    <img
      :src="affilicationLogoMap[liverEvent.affilication]"
      class="absolute bottom-[4px] left-[2px] w-[clamp(20px,4vw,28px)]"
      loading="lazy"
    />

    <a
      ref="button"
      :href="liverEvent.url"
      target="_blank"
      class="transition-all max-w-[560px] h-[108px] shadow-md flex flex-row justify-center items-center gap-[12px] pl-2 overflow-hidden rounded-[10px] bg-white max-sm:gap-1 max-sm:pl-1 max-sm:h-auto"
      :class="{
        isLive: liverEvent.isLive,
        isFinished: isFinished,
        isHovered: isHovered,
      }"
      @click="onClickCard"
    >
      <div class="w-[70px] max-sm:w-[clamp(30px,10vw,70px)]">
        <img
          :src="liverEvent.talent.image"
          class="rounded-full w-full aspect-square border"
          loading="lazy"
          @contextmenu.prevent="talentStore.setFocusedTalent(liverEvent.talent.name)"
        />
      </div>
      <div class="flex flex-col items-start gap-p2 flex-1 max-sm:py-1">
        <h3 class="font-bold">{{ liverEvent.talent.name }}</h3>
        <div class="line-clamp-2">{{ liverEvent.title }}</div>
        <div class="flex flex-row z-10">
          <img
            v-for="talent in liverEvent.collaboTalents"
            :key="talent.image"
            :src="talent.image"
            class="rounded-full w-[24px] h-[24px] -mr-1 outline outline-white outline-1 hover:outline hover:outline-red-500 hover:outline-2"
            :title="talent.name"
            loading="lazy"
            @mouseenter="hoverTalent(talent.name)"
            @mouseleave="hoverTalent(null)"
            @contextmenu.prevent="talentStore.setFocusedTalent(talent.name)"
          />
        </div>
      </div>

      <img
        :src="getThumnail(liverEvent.thumbnail, 'mq')"
        class="aspect-video object-cover h-full max-sm:w-[clamp(140px,30vw,200px)]"
        loading="lazy"
      />
    </a>

    <dialog
      ref="dialogEl"
      @click="onClickDialog"
      class="fixed w-[480px] rounded-[20px] overflow-hidden shadow-xl"
    >
      <div class="px-4 py-2">
        <div class="font-bold">
          {{ dateFormatter.format(liverEvent.startAt) }}
        </div>
      </div>

      <a :href="liverEvent.url" target="_blank">
        <img
          :src="getThumnail(liverEvent.thumbnail, 'sd')"
          class="w-[480px] aspect-video object-cover"
          loading="lazy"
        />
      </a>

      <div class="px-6 py-4 flex flex-col gap-2 max-sm:p-3">
        <div class="font-bold text-lg">
          <a :href="liverEvent.url" class="hover:underline" target="_blank">
            {{ liverEvent.title }}
          </a>
        </div>
        <div class="flex flex-row gap-2 items-center">
          <img
            :src="liverEvent.talent.image"
            class="rounded-full w-[70px] h-[70px] border hover:outline hover:outline-red-500 hover:outline-2"
            loading="lazy"
            @mouseover="hoverTalent(liverEvent.talent.name)"
            @mouseleave="hoverTalent(null)"
            @click.prevent="talentStore.setFocusedTalent(liverEvent.talent.name)"
            @contextmenu.prevent="talentStore.setFocusedTalent(liverEvent.talent.name)"
          />
          <div>
            <div class="font-bold text-base">
              {{ liverEvent.talent.name }}
            </div>
            <div class="flex flex-row flex-wrap">
              <img
                v-for="talent in liverEvent.collaboTalents"
                :key="talent.image"
                :src="talent.image"
                class="rounded-full w-[40px] hover:outline hover:outline-red-500 hover:outline-2 max-sm:w-[30px]"
                :title="talent.name"
                loading="lazy"
                @mouseenter="hoverTalent(talent.name)"
                @mouseleave="hoverTalent(null)"
                @click.prevent="talentStore.setFocusedTalent(talent.name)"
                @contextmenu.prevent="talentStore.setFocusedTalent(talent.name)"
              />
            </div>
          </div>
        </div>
      </div>
    </dialog>
  </div>
</template>

<style scoped>
.isLive {
  @apply outline outline-4 -outline-offset-4 outline-red-600;
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
