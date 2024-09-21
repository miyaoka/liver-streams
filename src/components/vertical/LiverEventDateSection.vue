<script setup lang="ts">
import { computed } from "vue";
import LiverEventTimeSection, { type TimeSection } from "./LiverEventTimeSection.vue";
import { useDateStore } from "@/store/dateStore";
import { mmddDateFormatter } from "@/utils/dateFormat";

export interface DateSection {
  time: number;
  date: Date;
  timeSectionList: TimeSection[];
}

const props = defineProps<{
  dateSection: DateSection;
  prevSection: DateSection | undefined;
  nextSection: DateSection | undefined;
}>();

const dateStore = useDateStore();

const dateMap = new Map<number, string>([
  [0, "today"],
  [-1, "yesterday"],
  [1, "tomorrow"],
]);

const sectionInfo = computed(() => {
  const dateDiff = compareDate({
    base: dateStore.currentDateWithoutTime,
    target: props.dateSection.date,
  });

  return {
    dateDiff,
    dateLabel: dateMap.get(dateDiff),
    mmdd: mmddDateFormatter.format(props.dateSection.date),
  };
});

function compareDate({ base, target }: { base: Date; target: Date }): number {
  const oneDay = 24 * 60 * 60 * 1000;

  // 日数差を計算
  const differenceInDays = (target.getTime() - base.getTime()) / oneDay;

  return differenceInDays;
}

function scrollToSectionTop(time: number) {
  const targetSectionEl = document.querySelector(`[data-date-section-time="${time}"]`);
  if (!targetSectionEl) return;
  targetSectionEl.scrollIntoView({ behavior: "smooth" });
}
</script>

<template>
  <section class="relative pt-4 pb-12" :data-date-section-time="`${dateSection.time}`">
    <!-- date divider -->
    <div class="absolute w-full -top-1 border-t-2 border-dashed border-white border-opacity-80" />
    <!-- date button -->
    <div
      class="sticky z-20 top-4 mb-8 flex flex-col items-center justify-center pointer-events-none"
    >
      <div class="relative pointer-events-auto flex flex-row items-center">
        <button
          :class="`px-2 py-1 rounded-2xl flex flex-row gap-1 items-center shadow-md border border-gray-300 border-1 ${sectionInfo.dateDiff === 0 ? 'text-white bg-blue-700' : 'text-white bg-gray-800'}`"
          @click="scrollToSectionTop(dateSection.time)"
        >
          <span class="text-xs" v-if="sectionInfo.dateLabel">
            {{ sectionInfo.dateLabel }}
          </span>
          <span class="text-base font-bold">
            {{ sectionInfo.mmdd }}
          </span>
        </button>

        <button
          v-if="prevSection"
          class="absolute right-full w-6 h-6 mr-1 flex items-center justify-center rounded-full bg-gray-700 bg-opacity-80"
          @click="scrollToSectionTop(prevSection.time)"
        >
          <i class="i-mdi-chevron-up text-white h-6 w-6" />
        </button>
        <button
          v-if="nextSection"
          class="absolute left-full w-6 h-6 ml-1 flex items-center justify-center rounded-full bg-gray-700 bg-opacity-80"
          @click="scrollToSectionTop(nextSection.time)"
        >
          <i class="i-mdi-chevron-down text-white h-6 w-6" />
        </button>
      </div>
    </div>
    <!-- event list -->
    <LiverEventTimeSection
      v-for="(section, i) in dateSection.timeSectionList"
      :key="section.time"
      :section="section"
      :nextSection="dateSection.timeSectionList[i + 1]"
    />
  </section>
</template>
