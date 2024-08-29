<script setup lang="ts">
import type { DateGroup, VideoDetail } from '@/schedule'
import { computed, onMounted, ref } from 'vue'

const props = defineProps<{
  date: DateGroup
}>()

const channels = ref<VideoWithDuration[][]>([])

const minute = 60 * 1000
// 仮の動画の長さ
const defaultDuration = 90 * minute
const shortsDuration = 30 * minute
const pixelPerHour = 150

interface VideoWithDuration extends VideoDetail {
  startTime: Date
  endTime: Date
  offset: number
  isShorts: boolean
}
const currentDate = computed(() => {
  return new Date(props.date.datetime)
})
const videoList = computed<VideoWithDuration[]>(() => {
  const originTime = currentDate.value.getTime()
  return props.date.videoList.map((video) => {
    const startTime = new Date(video.datetime)
    const isShorts = false ///shorts/i.test(video.title)
    const duration = isShorts ? shortsDuration : defaultDuration
    const endTime = new Date(startTime.getTime() + duration)
    return {
      ...video,
      startTime,
      endTime,
      offset: (startTime.getTime() - originTime) / 1000 / 3600,
      isShorts
    }
  })
})

// videoが重ならないようにチャンネルに詰めていく
function makeChannels() {
  videoList.value.forEach((video) => {
    let channel = channels.value.find((channel) => {
      const lastVideo = channel[channel.length - 1]
      return lastVideo.endTime < video.startTime
    })
    if (!channel) {
      channel = []
      channels.value.push(channel)
    }
    channel.push(video)
  })
}
onMounted(() => {
  makeChannels()
  console.log('channels', channels)
})
</script>
<template>
  <div class="flex flex-col" :style="{ minWidth: `${pixelPerHour * 24}px` }">
    <h2 class="p-4 flex bg-red-300">{{ date.displayDate }}</h2>
    <div class="flex flex-col relative text-xs">
      <div class="flex flex-row absolute inset-0">
        <div v-for="hour in 24" :key="hour" class="flex-1 bg-slate-50 even:bg-white">
          {{ hour - 1 }}
        </div>
      </div>
      <div v-for="(channel, i) in channels" :key="i" class="h-[270px] relative border-b-2">
        <div
          v-for="video in channel"
          :key="video.url"
          class="absolute shadow-lg w-[240px]"
          :class="{ isShorts: video.isShorts }"
          :style="{ left: `${video.offset * pixelPerHour}px` }"
        >
          <div class="absolute bottom-full bg-slate-700 text-white p-1 text-sm">
            {{ video.displayDate }}
          </div>

          <div
            :class="`bg-white rounded-[20px] overflow-hidden ${video.isLive ? 'outline outline-red-500 outline-8' : ''}`"
          >
            <a :href="video.url" :title="video.title" class="relative" target="_blank">
              <img :src="video.thumbnail" class="w-full h-[135px] object-cover" />
            </a>
            <div class="flex flex-col p-2">
              <div class="flex flex-row items-center gap-2">
                <img
                  :src="video.talent.iconImageUrl"
                  class="rounded-full w-[36px] h-[36px]"
                  :title="video.name"
                />
                <h3 class="text-base">{{ video.name }}</h3>
              </div>
              <div>
                <h3>{{ video.title }}</h3>
                <div class="flex flex-row flex-wrap items-end">
                  <img
                    v-for="talent in video.collaboTalents"
                    :key="talent.iconImageUrl"
                    :src="talent.iconImageUrl"
                    class="rounded-full w-[24px] h-[24px]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
