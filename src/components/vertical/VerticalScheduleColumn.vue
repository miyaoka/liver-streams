<script setup lang="ts">
import { computed } from "vue";
import VerticalScheduleSection from "./VerticalScheduleSection.vue";
import type { LiverEvent } from "@/api";

const props = defineProps<{
  sectionMap: Record<number, LiverEvent[]>;
}>();

const entries = computed(() => Object.entries(props.sectionMap));
</script>
<template>
  <VerticalScheduleSection
    v-for="(section, i) in entries"
    :key="section[0]"
    :section="section"
    :nextSection="entries[i + 1]"
  />
</template>
