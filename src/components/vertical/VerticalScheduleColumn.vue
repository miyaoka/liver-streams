<script setup lang="ts">
import type { VideoDetailWithTime } from './VerticalSchedule.vue'
import VerticalScheduleSection from './VerticalScheduleSection.vue'

const props = defineProps<{
  sectionMap: Record<number, (VideoDetailWithTime | VideoDetailWithTime[])[]>
}>()

const entries = Object.entries(props.sectionMap)
</script>
<template>
  <div class="flex flex-row flex-wrap mt-4 gap-y-[40px] bg-slate-100">
    <VerticalScheduleSection
      v-for="(section, i) in entries"
      :key="section[0]"
      :section="section"
      :nextSection="entries[i + 1]"
    />
  </div>
</template>
