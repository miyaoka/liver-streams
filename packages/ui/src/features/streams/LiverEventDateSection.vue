<script setup lang="ts">
import type { DateSection } from "@liver-streams/core";
import { compareDate, mdDateFormatter, relativeDateFormatter } from "@liver-streams/core";
import { computed } from "vue";
import { scrollToSectionTop } from "../../shared/lib/scroll";
import { useDateStore } from "../../shared/stores/dateStore";
import LiverEventTimeSection from "./LiverEventTimeSection.vue";

const props = defineProps<{
  dateSection: DateSection;
  prevSection: DateSection | undefined;
  nextSection: DateSection | undefined;
}>();

const dateStore = useDateStore();

const sectionInfo = computed(() => {
  const dateDiff = compareDate({
    baseDateTime: dateStore.currentDateTime,
    targetDateTime: props.dateSection.date.getTime(),
  });

  return {
    dateDiff,
    relative: relativeDateFormatter.format(dateDiff, "days"),
    mmdd: mdDateFormatter.format(props.dateSection.date),
  };
});
</script>

<template>
  <section class="relative pt-0 pb-12" data-id="date-section" :data-time="`${dateSection.time}`">
    <div class="absolute -top-1 w-full border-t-2 border-dashed border-white/80" />
    <header class="pointer-events-none sticky top-0 z-30 flex pt-2 pl-2">
      <button
        class="pointer-events-auto flex flex-row items-center gap-1 rounded-lg border-0 px-2 py-1 shadow-md"
        :class="{
          'border-yellow-100 bg-yellow-400 text-black hover:bg-yellow-500':
            sectionInfo.dateDiff === 0,
          'border-gray-300 bg-gray-100 text-gray-900 hover:bg-gray-200': sectionInfo.dateDiff > 0,
          'border-gray-300 bg-gray-700  text-gray-300 hover:bg-gray-800': sectionInfo.dateDiff < 0,
        }"
        @click="scrollToSectionTop(dateSection.time)"
      >
        <span class="text-base font-bold"> {{ sectionInfo.mmdd }} {{ sectionInfo.relative }} </span>
      </button>
    </header>
    <LiverEventTimeSection
      v-for="(section, i) in dateSection.timeSectionList"
      :key="section.time"
      :section="section"
      :nextSection="dateSection.timeSectionList[i + 1]"
      :isCurrentTime="section.time === dateStore.currentHourTime"
    />
  </section>
</template>
