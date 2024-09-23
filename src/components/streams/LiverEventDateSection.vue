<script setup lang="ts">
import { computed } from "vue";
import LiverEventTimeSection from "./LiverEventTimeSection.vue";
import type { DateSection } from "@/lib/section";
import { scrollToSectionTop } from "@/lib/scroll";
import { useDateStore } from "@/store/dateStore";
import { compareDate } from "@/utils/date";
import { mdwdayDateFormatter } from "@/utils/dateFormat";

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
    mmdd: mdwdayDateFormatter.format(props.dateSection.date),
  };
});
</script>

<template>
  <section class="relative pb-12 pt-4" data-id="date-section" :data-time="`${dateSection.time}`">
    <div class="absolute -top-1 w-full border-t-2 border-dashed border-white border-opacity-80" />
    <header
      class="pointer-events-none sticky top-4 z-20 mb-8 flex flex-col items-center justify-center"
    >
      <div class="pointer-events-auto relative flex flex-row items-center">
        <button
          v-if="prevSection"
          class="absolute right-full flex h-11 w-11 items-center justify-center"
          @click="scrollToSectionTop(prevSection.time)"
        >
          <div class="h-5 w-5 rounded-full bg-gray-700 bg-opacity-80">
            <i class="i-mdi-chevron-up h-5 w-5 text-white" />
          </div>
        </button>

        <button
          :class="`border-1 flex flex-row items-center gap-1 rounded-2xl border border-gray-300 px-2 py-1 shadow-md ${sectionInfo.dateDiff === 0 ? 'bg-blue-700 text-white' : 'bg-gray-800 text-white'}`"
          @click="scrollToSectionTop(dateSection.time)"
        >
          <span class="text-base font-bold">
            {{ sectionInfo.mmdd }}
          </span>
        </button>

        <button
          v-if="nextSection"
          class="absolute left-full flex h-11 w-11 items-center justify-center"
          @click="scrollToSectionTop(nextSection.time)"
        >
          <div class="h-5 w-5 rounded-full bg-gray-700 bg-opacity-80">
            <i class="i-mdi-chevron-down h-5 w-5 text-white" />
          </div>
        </button>
      </div>
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
