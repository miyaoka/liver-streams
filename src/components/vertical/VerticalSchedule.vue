<script setup lang="ts">
import type { Schedule, VideoDetail } from '@/schedule'
import { computed, onMounted } from 'vue'
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

const videoList = computed<Record<number, (VideoDetailWithTime | VideoDetailWithTime[])[]>>(() => {
  // 全日付の動画をflat化し、time情報を付加
  const wholeList: VideoDetailWithTime[] = props.data.dateGroupList
    .flatMap((dataGroup) => dataGroup.videoList)
    .map((video) => {
      const startTime = new Date(video.datetime).getTime()
      return {
        ...video,
        startTime
      }
    })

  // コラボしているタレント名を抽出
  const collaboNameMap: Record<string, number> = {}
  wholeList.forEach((video) => {
    const collaboTalents = video.collaboTalents
    if (collaboTalents.length === 0) return

    const names = [video.talent.name, ...collaboTalents.map((t) => t.name)].sort().join(',')
    const time = collaboNameMap[names]

    // 一番早い動画の開始時間を記録
    if (time === undefined || time > video.startTime) {
      collaboNameMap[names] = video.startTime
    }
  })

  const videoList: (VideoDetailWithTime | VideoDetailWithTime[])[] = []
  const collaboVideoMap: Record<string, VideoDetailWithTime[]> = {}

  // コラボ判定する時間範囲
  const collaboTimeRange = 60 * 60 * 1000

  const collaboEntries = Object.entries(collaboNameMap)

  wholeList.forEach((video) => {
    for (const [names, time] of collaboEntries) {
      // コラボ範囲
      if (Math.abs(video.startTime - time) < collaboTimeRange) {
        // 配信者名がコラボkeyに含まれているか
        if (names.match(video.talent.name)) {
          // 配列に追加
          if (!collaboVideoMap[names]) {
            collaboVideoMap[names] = []
          }
          collaboVideoMap[names].push(video)
          return
        }
      }
    }
    // コラボでない動画
    videoList.push(video)
  })

  function getTime(item: VideoDetailWithTime | VideoDetailWithTime[]): number {
    if (!Array.isArray(item)) return item.startTime
    return item[0].startTime
    // return Math.min(...item.map((i) => i.startTime))
  }

  Object.values(collaboVideoMap).forEach((videos) => {
    // コラボ動画が1つの場合はそのまま追加
    if (videos.length === 1) {
      return videoList.push(...videos)
    }
    // 複数なら配列として追加
    videoList.push(videos)
  })

  videoList.sort((a, b) => {
    return getTime(a) - getTime(b)
  })

  const sectionVideoList: Record<number, (VideoDetailWithTime | VideoDetailWithTime[])[]> = {}

  // 6hrごとに区切る
  const sectionSpan = 6 * 60 * 60 * 1000
  const timezoneOffset = 9 * 60 * 60 * 1000

  videoList.forEach((video) => {
    const time = Array.isArray(video) ? getTime(video[0]) : video.startTime
    // 区切った時間に丸める
    const sectionTime =
      Math.floor((time - timezoneOffset) / sectionSpan) * sectionSpan + timezoneOffset

    if (!sectionVideoList[sectionTime]) {
      sectionVideoList[sectionTime] = []
    }
    sectionVideoList[sectionTime].push(video)
  })

  return sectionVideoList
})
</script>
<template>
  <VerticalScheduleColumn :sectionMap="videoList" />
</template>
