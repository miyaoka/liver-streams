<script setup lang="ts">
import LiverEventTimeSection, { type TimeSection } from "./LiverEventTimeSection.vue";

export interface DateSection {
  time: number;
  date: Date;
  timeSectionList: TimeSection[];
}

defineProps<{
  dateSection: DateSection;
}>();
</script>

<template>
  <div>
    <div class="sticky z-30 top-0 flex items-center justify-center">
      <button :class="`font-bold text-white bg-gray-800 px-4`">
        {{ new Date(dateSection.time).toLocaleDateString() }}
      </button>
    </div>
    <LiverEventTimeSection
      v-for="(section, i) in dateSection.timeSectionList"
      :key="section.time"
      :section="section"
      :nextSection="dateSection.timeSectionList[i + 1]"
    />
  </div>
</template>
