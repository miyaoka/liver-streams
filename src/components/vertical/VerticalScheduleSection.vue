<script setup lang="ts">
import type { VideoDetailWithTime } from './VerticalSchedule.vue'
import VerticalScheduleSectionItem from './VerticalScheduleSectionItem.vue'

defineProps<{
  time: number
  videoList: (VideoDetailWithTime | VideoDetailWithTime[])[]
}>()

const dateFormatter = new Intl.DateTimeFormat('ja-JP', {
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit'
})

function sectionTime(time: number) {
  const date = new Date(time)

  const str = dateFormatter.format(date)
  return str
}
</script>
<template>
  <section class="flex flex-col w-full gap-[20px] pt-4" :data-time="time">
    <div class="flex w-full items-center justify-center sticky z-10 top-4">
      <div class="bg-slate-700 text-gray-100 font-bold px-3 py-1 rounded-full">
        {{ sectionTime(time) }}
      </div>
    </div>
    <div class="flex flex-row flex-wrap gap-[20px] bg-slate-100">
      <div v-for="item in videoList" :key="(Array.isArray(item) ? item[0] : item).url">
        <div
          v-if="Array.isArray(item)"
          class="outline outline-[6px] p-4 outline-sky-200 bg-sky-100 rounded-[10px] flex flex-wrap gap-[20px]"
        >
          <VerticalScheduleSectionItem v-for="video in item" :key="video.url" :video="video" />
        </div>
        <VerticalScheduleSectionItem v-else :video="item" />
      </div>
    </div>
  </section>
</template>
