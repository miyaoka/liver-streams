<script setup lang="ts">
import type { VideoDetailWithTime } from './VerticalSchedule.vue'
import VerticalScheduleSection from './VerticalScheduleSection.vue'

const props = defineProps<{
  sectionMap: Record<number, (VideoDetailWithTime | VideoDetailWithTime[])[]>
}>()
</script>
<template>
  <div class="flex flex-row flex-wrap mt-4 gap-y-[40px] bg-slate-100">
    <VerticalScheduleSection
      v-for="[time, videoList] in Object.entries(props.sectionMap)"
      :key="time"
      :time="Number(time)"
      :videoList="videoList"
    />
  </div>
</template>
