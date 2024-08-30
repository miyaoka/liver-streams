<script setup lang="ts">
import type { Schedule, VideoDetail } from '@/schedule'
import { onMounted, ref, watch } from 'vue'
import VerticalScheduleColumn from './VerticalScheduleColumn.vue'

const props = defineProps<{
  data: Schedule
}>()

onMounted(() => {
  const now = Date.now()
  const sections = [...document.querySelectorAll('section[data-time]')]
  const sectionIndex = sections.findIndex((el) => {
    const time = Number(el.getAttribute('data-time'))
    // 現在時刻を超える最初のセクションを探す
    if (time > now) return true
  })
  // 現在時刻の直前のセクション
  const prevSection = sections[sectionIndex - 1]

  if (prevSection) {
    // セクションにスクロール
    prevSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
})

export interface VideoDetailWithTime extends VideoDetail {
  startTime: number
}

const sectionMap = ref<Record<number, VideoDetailWithTime[]>>({})

watch(
  () => props.data,
  (newData) => {
    sectionMap.value = createSectionMap(newData)
  },
  { immediate: true, deep: true }
)

function createSectionMap(data: Schedule): Record<number, VideoDetailWithTime[]> {
  // 全日付の動画をflat化し、time情報を付加
  const wholeList: VideoDetailWithTime[] = data.dateGroupList
    .flatMap((dataGroup) => dataGroup.videoList)
    .map((video) => {
      const startTime = new Date(video.datetime).getTime()
      return {
        ...video,
        startTime
      }
    })

  const sectionVideoList: Record<number, VideoDetailWithTime[]> = {}

  // 6hrごとに区切る
  const sectionSpan = 6 * 60 * 60 * 1000
  const timezoneOffset = 9 * 60 * 60 * 1000

  wholeList.forEach((video) => {
    const time = video.startTime
    // 区切った時間に丸める
    const sectionTime =
      Math.floor((time - timezoneOffset) / sectionSpan) * sectionSpan + timezoneOffset

    if (!sectionVideoList[sectionTime]) {
      sectionVideoList[sectionTime] = []
    }
    sectionVideoList[sectionTime].push(video)
  })

  return sectionVideoList
}
</script>
<template>
  <VerticalScheduleColumn :sectionMap="sectionMap" />
</template>
