<script setup lang="ts">
import { ref } from 'vue'
import type { VideoDetailWithTime } from './VerticalSchedule.vue'

defineProps<{
  video: VideoDetailWithTime
}>()

const dialogEl = ref<HTMLDialogElement | null>(null)

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
</script>
<template>
  <div :class="`relative hover:scale-105 hover:z-10 transition-all`">
    <div class="absolute bg-white text-gray-400 font-bold px-2 left-6 -top-2 shadow rounded-full">
      {{ video.displayDate }}
    </div>

    <a
      ref="button"
      :href="video.url"
      target="_blank"
      :class="`bg-white shadow-md w-[560px] h-[108px] flex flex-row justify-center items-center gap-[12px] pl-[17px] overflow-hidden rounded-[10px] ${video.isLive ? 'outline outline-red-500 outline-2 ' : ''}`"
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
            class="rounded-full w-[24px] h-[24px]"
            :title="talent.name"
            loading="lazy"
          />
        </div>
      </div>

      <img :src="video.thumbnail" class="w-[192px] h-[108px] object-cover" loading="lazy" />
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

      <a
        :href="video.url"
        class="flex gap-4 flex-col text-blue-700 hover:underline flex-1"
        target="_blank"
      >
        <img :src="video.thumbnail" class="w-[480px] h-[270px] object-cover" loading="lazy" />
      </a>

      <div class="px-6 py-4 flex flex-col gap-2">
        <div class="font-bold text-lg">
          <a :href="video.url" target="_blank">
            {{ video.title }}
          </a>
        </div>
        <div class="flex flex-row gap-2 items-center">
          <img
            :src="video.talent.iconImageUrl"
            class="rounded-full w-[70px] h-[70px] border"
            loading="lazy"
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
                class="rounded-full w-[40px] h-[40px]"
                :title="talent.name"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </dialog>
  </div>
</template>
