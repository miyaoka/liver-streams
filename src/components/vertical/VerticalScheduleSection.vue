<script setup lang="ts">
import { computed, ref } from 'vue'
import type { VideoDetailWithTime } from './VerticalSchedule.vue'
import VerticalScheduleSectionItem from './VerticalScheduleSectionItem.vue'
import { useDateStore } from '@/store/dateStore'

const props = defineProps<{
  section: [string, (VideoDetailWithTime | VideoDetailWithTime[])[]]
  nextSection: [string, (VideoDetailWithTime | VideoDetailWithTime[])[]] | undefined
}>()

const dateStore = useDateStore()

const time = computed(() => Number(props.section[0]))
const nextTime = computed(() => (props.nextSection ? Number(props.nextSection[0]) : Infinity))
const videoList = computed(() => props.section[1])
const isCurrent = computed(() => {
  const now = dateStore.date.getTime()
  return now >= time.value && now < nextTime.value
})

const dateFormatter = new Intl.DateTimeFormat('ja-JP', {
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit'
})

const sectionEl = ref<HTMLElement | null>(null)

function sectionTime(time: number) {
  const date = new Date(time)

  const str = dateFormatter.format(date)
  return str
}
function scrollToSectionTop() {
  if (!sectionEl.value) return
  sectionEl.value.scrollIntoView({ behavior: 'smooth' })
}
</script>
<template>
  <section
    ref="sectionEl"
    :class="`flex flex-col w-full gap-[20px] pt-4 ${isCurrent ? 'bg-yellow-100' : ''}`"
    :data-time="time"
  >
    <div class="flex w-full items-center justify-center sticky z-20 top-4">
      <button
        :class="`bg-slate-700 text-gray-100 font-bold px-3 py-1 rounded-full ${isCurrent ? 'bg-red-700' : ''}`"
        @click="scrollToSectionTop"
      >
        {{ sectionTime(time) }}
      </button>
    </div>
    <div class="flex flex-row flex-wrap gap-[20px] p-8">
      <div v-for="item in videoList" :key="(Array.isArray(item) ? item[0] : item).url">
        <div
          v-if="Array.isArray(item)"
          class="p-2 bg-black bg-opacity-10 rounded-[10px] flex flex-wrap gap-[20px]"
        >
          <VerticalScheduleSectionItem v-for="video in item" :key="video.url" :video="video" />
        </div>
        <VerticalScheduleSectionItem v-else :video="item" />
      </div>
    </div>
  </section>
</template>
