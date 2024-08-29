<script setup lang="ts">
import type { VideoDetailWithTime } from './VerticalSchedule.vue'
import VerticalScheduleSectionItem from './VerticalScheduleSectionItem.vue'

defineProps<{
  time: number
  videoList: (VideoDetailWithTime | VideoDetailWithTime[])[]
}>()

const dateFormatter = new Intl.DateTimeFormat('ja-JP', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit'
})

function sectionTime(time: number) {
  const date = new Date(time)

  const str = dateFormatter.format(date)
  // 00:00の場合は日付を含めて表示
  if (str.endsWith('00:00')) return str
  // それ以外は時間のみ表示
  return str.slice(11)
}
</script>
<template>
  <div class="flex flex-col w-full gap-[20px]">
    <div class="flex w-full items-center justify-center">
      <div class="bg-slate-700 text-gray-100 font-bold px-3 py-1 rounded-full">
        {{ sectionTime(time) }}
      </div>
    </div>
    <div class="flex flex-row flex-wrap gap-[20px] bg-slate-100">
      <div v-for="item in videoList" :key="(Array.isArray(item) ? item[0] : item).url">
        <div
          v-if="Array.isArray(item)"
          class="outline bg-slate-300 rounded-[10px] flex flex-wrap gap-[20px]"
        >
          <VerticalScheduleSectionItem v-for="video in item" :key="video.url" :video="video" />
        </div>
        <VerticalScheduleSectionItem v-else :video="item" />
      </div>
    </div>
  </div>
</template>
