<script setup lang="ts">
import { computed, ref } from "vue";
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

    dateLabel: dateMap.get(dateDiff) ?? dateDiff,
    mmdd: mmddDateFormatter.format(props.dateSection.date),
  };
});

function compareDate({ base, target }: { base: Date; target: Date }): number {
  const oneDay = 24 * 60 * 60 * 1000;

  // 日数差を計算
  const differenceInDays = (target.getTime() - base.getTime()) / oneDay;

  return differenceInDays;
}

const dateSectionEl = ref<HTMLElement | null>(null);

function scrollToSectionTop() {
  if (!dateSectionEl.value) return;
  dateSectionEl.value.scrollIntoView({ behavior: "smooth" });
}
</script>

<template>
  <div class="relative pt-4" ref="dateSectionEl">
    <div class="absolute w-full top-8 border-t-2 border-dashed border-white border-opacity-70" />
    <div class="sticky z-20 top-4 flex items-center justify-center">
      <button
        :class="`px-4 py-1 rounded-2xl flex flex-row gap-2 items-center shadow-md outline outline-white outline-1 ${sectionInfo.dateDiff === 0 ? 'text-white bg-blue-700' : 'text-white bg-gray-800'}`"
        @click="scrollToSectionTop"
      >
        <span class="text-xs">
          {{ sectionInfo.dateLabel }}
        </span>
        <span class="text-lg font-bold">
          {{ sectionInfo.mmdd }}
        </span>
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
