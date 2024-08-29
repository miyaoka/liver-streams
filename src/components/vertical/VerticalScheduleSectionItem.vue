<script setup lang="ts">
import type { VideoDetailWithTime } from './VerticalSchedule.vue'

defineProps<{
  video: VideoDetailWithTime
}>()
</script>
<template>
  <div :class="`relative hover:scale-105 hover:z-10 transition-all`">
    <div class="absolute bg-white text-gray-400 font-bold px-2 left-6 -top-2 shadow rounded-full">
      {{ video.displayDate }}
    </div>

    <a
      :href="video.url"
      target="_blank"
      :class="`bg-white shadow w-[560px] h-[108px] flex flex-row justify-center items-center gap-[12px] pl-[17px] overflow-hidden rounded-[10px] ${video.isLive ? 'outline outline-red-500 outline-2 ' : ''}`"
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
  </div>
</template>
