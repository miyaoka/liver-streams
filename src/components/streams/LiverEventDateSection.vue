<script setup lang="ts">
import { computed } from "vue";
import LiverEventTimeSection from "./LiverEventTimeSection.vue";
import type { DateSection } from "@/lib/section";
import { scrollToSectionTop } from "@/lib/scroll";
import { useDateStore } from "@/store/dateStore";
import { compareDate } from "@/utils/date";
import { mdDateFormatter, relativeDateFormatter } from "@/utils/dateFormat";

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
  <section class="relative pb-12 pt-0" data-id="date-section" :data-time="`${dateSection.time}`">
    <div class="absolute -top-1 w-full border-t-2 border-dashed border-white/80" />
    <header class="pointer-events-none sticky top-0 z-30 flex pl-2 pt-2">
      <button
        class="pointer-events-auto flex flex-row items-center gap-1 rounded-lg border-0 px-2 py-1 shadow-md"
        :class="{
          'border-yellow-100 bg-yellow-400 text-black hover:bg-yellow-500':
            sectionInfo.dateDiff === 0,
          'border-gray-300 bg-gray-100 text-black hover:bg-gray-200': sectionInfo.dateDiff > 0,
          'border-gray-300 bg-gray-700  text-white hover:bg-gray-800': sectionInfo.dateDiff < 0,
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
