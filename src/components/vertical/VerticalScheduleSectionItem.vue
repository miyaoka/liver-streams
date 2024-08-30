<script setup lang="ts">
import { computed, ref } from 'vue'
import type { VideoDetailWithTime } from './VerticalSchedule.vue'
import { useTalentStore } from '@/store/talentStore'

const props = defineProps<{
  video: VideoDetailWithTime
}>()

const talentStore = useTalentStore()
const dialogEl = ref<HTMLDialogElement | null>(null)

// 配信終了判定
const isFinished = computed(() => {
  // 配信中か
  if (props.video.isLive) return false

  const now = Date.now()
  // 現在時刻を過ぎているか
  if (now < props.video.startTime) return false
  // 配信していなくてstartTimeが00以外であれば終了と判定（配信開始後には実際の配信開始時刻が入るため）
  if (!props.video.datetime.endsWith(':00')) return true
  // 配信しないまま1時間経ったら終了と判定
  if (now - props.video.startTime > 60 * 60 * 1000) return true
  return false
})

const isHovered = computed(() => {
  return (
    talentStore.hoveredTalent === props.video.talent.name ||
    props.video.collaboTalents.some((talent) => talentStore.hoveredTalent === talent.name)
  )
})

// 通常クリック時はダイアログを開き、ホイールクリックでリンクを開く
function onClickCard(evt: MouseEvent) {
  evt.preventDefault()
  if (!dialogEl.value) return
  dialogEl.value.showModal()
}
// ダイアログ外をクリックしたら閉じる
function onClickDialog(evt: MouseEvent) {
  if (!dialogEl.value) return
  // ターゲットがダイアログならダイアログ外判定
  if (evt.target !== dialogEl.value) return
  evt.preventDefault()
  dialogEl.value.close()
}

function hoverTalent(name: string | null) {
  talentStore.hoveredTalent = name
}
</script>
<template>
  <div
    class="relative hover:scale-105 hover:z-10 transition-all"
    :class="{ isFinished: isFinished && !isHovered }"
    @mouseover="hoverTalent(video.talent.name)"
    @mouseleave="hoverTalent(null)"
  >
    <div class="absolute bg-white text-gray-400 font-bold px-2 left-6 -top-2 shadow rounded-full">
      {{ video.displayDate }}
    </div>

    <a
      ref="button"
      :href="video.url"
      target="_blank"
      :class="`transition-all shadow-md w-[560px] h-[108px] flex flex-row justify-center items-center gap-[12px] pl-[17px] overflow-hidden rounded-[10px]  ${isHovered ? 'bg-pink-50' : 'bg-white '} ${video.isLive ? 'outline outline-red-500 outline-2 -outline-offset-2' : 'outline-1 -outline-offset-1'}`"
      @click="onClickCard"
    >
      <div class="w-[70px]">
        <img
          :src="video.talent.iconImageUrl"
          class="rounded-full w-[70px] h-[70px] border"
          loading="lazy"
        />
      </div>
      <div class="flex flex-col items-start gap-p2 flex-1">
        <h3 class="text-base font-bold">{{ video.talent.name }}</h3>
        <div class="line-clamp-2">{{ video.title }}</div>
        <div class="flex flex-row flex-wrap">
          <img
            v-for="talent in video.collaboTalents"
            :key="talent.iconImageUrl"
            :src="talent.iconImageUrl"
            class="rounded-full w-[24px] h-[24px] hover:outline hover:outline-red-500 hover:outline-2"
            :title="talent.name"
            loading="lazy"
            @mouseenter="hoverTalent(talent.name)"
            @mouseleave="hoverTalent(null)"
          />
        </div>
      </div>

      <img :src="video.thumbnail" class="w-[192px] h-[108px]" loading="lazy" />
    </a>
  </div>
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
      <img :src="video.thumbnail" class="w-[480px] h-[270px]" loading="lazy" />
    </a>

    <div class="px-6 py-4 flex flex-col gap-2">
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
        />
        <div>
          <div class="font-bold">
            {{ video.talent.name }}
          </div>
          <div class="flex flex-row flex-wrap">
            <img
              v-for="talent in video.collaboTalents"
              :key="talent.iconImageUrl"
              :src="talent.iconImageUrl"
              class="rounded-full w-[40px] h-[40px] hover:outline hover:outline-red-500 hover:outline-2"
              :title="talent.name"
              loading="lazy"
              @mouseenter="hoverTalent(talent.name)"
              @mouseleave="hoverTalent(null)"
            />
          </div>
        </div>
      </div>
    </div>
  </dialog>
</template>

<style scoped>
.isFinished:not(:hover) {
  opacity: 0.7;
  filter: grayscale(0.7);
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
