<script setup lang="ts">
import { computed, ref } from "vue";
import type { VideoDetailWithTime } from "./VerticalSchedule.vue";
import { useTalentStore } from "@/store/talentStore";

const props = defineProps<{
  video: VideoDetailWithTime;
}>();

const talentStore = useTalentStore();
const dialogEl = ref<HTMLDialogElement | null>(null);

// 配信終了判定
const isFinished = computed(() => {
  // 配信中か
  if (props.video.isLive) return false;

  const now = Date.now();
  // 現在時刻を過ぎているか
  if (now < props.video.startTime) return false;
  // 配信していなくてstartTimeが00以外であれば終了と判定（配信開始後には実際の配信開始時刻が入るため）
  if (!props.video.datetime.endsWith(":00")) return true;
  // 配信しないまま1時間経ったら終了と判定
  if (now - props.video.startTime > 60 * 60 * 1000) return true;
  return false;
});

const isHovered = computed(() => {
  return (
    talentStore.hoveredTalent === props.video.talent.name ||
    props.video.collaboTalents.some((talent) => talentStore.hoveredTalent === talent.name)
  );
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

function hoverTalent(name: string | null) {
  talentStore.hoveredTalent = name;
}

// サムネイルの画質を上げる
function getHqThumnail(url: string) {
  // 画像がyoutubeの場合、mq(320x180)のurlになっているのでsd(640x480)に置換する
  const matched = url.match(/mqdefault\.jpg$/);
  if (!matched) return url;
  return url.replace("mqdefault", "sddefault");
}
</script>
<template>
  <div
    class="relative hover:scale-105 hover:z-10 transition-all"
    @mouseover="hoverTalent(video.talent.name)"
    @mouseleave="hoverTalent(null)"
  >
    <div
      :class="`absolute bg-white ${isFinished ? 'text-gray-700' : 'text-blue-500'} font-bold px-2 left-3 -top-2 shadow rounded-full max-sm:-left-0 max-sm:-top-4`"
    >
      {{ video.displayDate }}
    </div>

    <div
      v-if="video.isLive || isFinished"
      :class="`absolute right-0 -top-4 px-4 text-white rounded-full  ${video.isLive ? 'bg-red-600' : 'bg-gray-500'}`"
    >
      {{ video.isLive ? "ON AIR" : "終了" }}
    </div>

    <a
      ref="button"
      :href="video.url"
      target="_blank"
      class="transition-all max-w-[560px] h-[108px] shadow-md flex flex-row justify-center items-center gap-[12px] pl-2 overflow-hidden rounded-[10px] bg-white max-sm:gap-1 max-sm:pl-1 max-sm:h-auto"
      :class="{
        isLive: video.isLive,
        isFinished: isFinished,
        isHovered: isHovered,
      }"
      @click="onClickCard"
    >
      <div class="w-[70px] max-sm:w-[clamp(30px,10vw,70px)]">
        <img
          :src="video.talent.iconImageUrl"
          class="rounded-full w-full aspect-square border"
          loading="lazy"
          @contextmenu.prevent="talentStore.setFocusedTalent(video.talent.name)"
        />
      </div>
      <div class="flex flex-col items-start gap-p2 flex-1 max-sm:py-1">
        <h3 class="font-bold">{{ video.talent.name }}</h3>
        <div class="line-clamp-2">{{ video.title }}</div>
        <div class="flex flex-row z-10">
          <img
            v-for="talent in video.collaboTalents"
            :key="talent.iconImageUrl"
            :src="talent.iconImageUrl"
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
        :src="video.thumbnail"
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
          {{ video.datetime }}
        </div>
      </div>

      <a :href="video.url" target="_blank">
        <img
          :src="getHqThumnail(video.thumbnail)"
          class="w-[480px] aspect-video object-cover"
          loading="lazy"
        />
      </a>

      <div class="px-6 py-4 flex flex-col gap-2 max-sm:p-3">
        <div class="font-bold text-lg">
          <a :href="video.url" class="hover:underline" target="_blank">
            {{ video.title }}
          </a>
        </div>
        <div class="flex flex-row gap-2 items-center">
          <img
            :src="video.talent.iconImageUrl"
            class="rounded-full w-[70px] h-[70px] border hover:outline hover:outline-red-500 hover:outline-2"
            loading="lazy"
            @mouseover="hoverTalent(video.talent.name)"
            @mouseleave="hoverTalent(null)"
            @click.prevent="talentStore.setFocusedTalent(video.talent.name)"
            @contextmenu.prevent="talentStore.setFocusedTalent(video.talent.name)"
          />
          <div>
            <div class="font-bold text-base">
              {{ video.talent.name }}
            </div>
            <div class="flex flex-row flex-wrap">
              <img
                v-for="talent in video.collaboTalents"
                :key="talent.iconImageUrl"
                :src="talent.iconImageUrl"
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
