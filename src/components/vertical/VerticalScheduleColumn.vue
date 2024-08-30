<script setup lang="ts">
import type { VideoDetailWithTime } from './VerticalSchedule.vue'
import VerticalScheduleSection from './VerticalScheduleSection.vue'

const props = defineProps<{
  sectionMap: Record<number, VideoDetailWithTime[]>
}>()

const entries = Object.entries(props.sectionMap)
</script>
<template>
  <VerticalScheduleSection
    v-for="(section, i) in entries"
    :key="section[0]"
    :section="section"
    :nextSection="entries[i + 1]"
  />
</template>
