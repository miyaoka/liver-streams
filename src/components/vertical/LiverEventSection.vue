<script setup lang="ts">
import { computed, ref } from "vue";
import LiverEventCard from "./LiverEventCard.vue";
import type { LiverEvent } from "@/api";
import { useDateStore } from "@/store/dateStore";
import { hhss } from "@/utils/dateFormat";

export interface Section {
  time: number;
  events: LiverEvent[];
}
const props = defineProps<{
  section: Section;
  nextSection: Section | undefined;
}>();

const dateStore = useDateStore();

const time = computed(() => {
  return props.section.time;
});
const nextTime = computed(() => (props.nextSection ? props.nextSection.time : Infinity));
const LiverEventList = computed(() => props.section.events);
const isCurrent = computed(() => {
  const now = dateStore.date.getTime();
  return now >= time.value && now < nextTime.value;
});
const isPast = computed(() => {
  const now = dateStore.date.getTime();
  return now > time.value;
});

const sectionEl = ref<HTMLElement | null>(null);

// 日付の時刻をリセット
function resetTime(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function compareDate(baseDate: Date, targetDate: Date): number {
  const base = resetTime(baseDate);
  const target = resetTime(targetDate);
  const oneDay = 24 * 60 * 60 * 1000;

  // 日数差を計算
  const differenceInDays = (target.getTime() - base.getTime()) / oneDay;

  return differenceInDays;
}

const sectionDate = computed(() => {
  return new Date(time.value);
});

const dateMap = new Map<number, string>([
  // [0, "today"],
  [-1, "yesterday"],
  [1, "tomorrow"],
]);
const sectionTime = computed(() => {
  const dateDiff = compareDate(dateStore.date, sectionDate.value);

  return {
    dateDiff,
    dateLabel: dateMap.get(dateDiff),
    hhss: hhss(sectionDate.value),
  };
});
function scrollToSectionTop() {
  if (!sectionEl.value) return;
  sectionEl.value.scrollIntoView({ behavior: "smooth" });
}

const bgColorMap = new Map<number, string>([
  [0, "#2a2c5d"],
  [1, "#2b2f62"],
  [2, "#2c3267"],
  [3, "#2d356c"],
  [4, "#2e3871"],
  [5, "#2f4077"],
  [6, "#5a7a74"],
  [7, "#779a8b"],
  [8, "#a0c5ba"],
  [9, "#c2e4dc"],
  [10, "#ddf7f3"],
  [11, "#f2fefb"],
  [12, "#ffffff"],
  [13, "#eff2f9"],
  [14, "#d9e8e6"],
  [15, "#c2cecc"],
  [16, "#b2b8b6"],
  [17, "#f7c8aa"],
  [18, "#ffc198"],
  [19, "#e09e8d"],
  [20, "#aa7f98"],
  [21, "#88678d"],
  [22, "#6d5a8d"],
  [23, "#4a486a"],
]);

const sectionBgColor = computed(() => {
  const hour = new Date(time.value).getHours();
  return bgColorMap.get(hour);
});

const nextSectionBgColor = computed(() => {
  if (!props.nextSection) return bgColorMap.get(0);
  const nextHour = new Date(props.nextSection.time).getHours();
  return bgColorMap.get(nextHour);
});
</script>
<template>
  <section
    ref="sectionEl"
    class="flex flex-col items-center gap-[20px] pt-4 min-h-6"
    :data-time="time"
    :style="{ background: `linear-gradient(${sectionBgColor}, ${nextSectionBgColor})` }"
  >
    <template v-if="LiverEventList.length > 0">
      <div class="sticky z-20 top-4">
        <button
          :class="`font-bold px-3 py-1 rounded-full shadow-md outline outline-white outline-1 ${sectionTime.dateDiff < 0 ? 'bg-gray-700 text-gray-400' : sectionTime.dateDiff === 0 ? 'bg-gray-800 text-white' : 'bg-gray-500 text-gray-100'}`"
          @click="scrollToSectionTop"
        >
          {{ sectionTime.dateLabel }} {{ sectionTime.hhss }}
        </button>
      </div>
      <div
        class="w-full grid grid-cols-[repeat(auto-fill,minmax(440px,1fr))] gap-y-[28px] py-8 max-xl:grid-cols-[repeat(auto-fill,minmax(360px,1fr))] px-[clamp(2px,2px+0.5vw,16px)] gap-x-[clamp(2px,2px+0.5vw,12px)]"
      >
        <LiverEventCard
          v-for="liverEvent in LiverEventList"
          :key="liverEvent.url"
          :liverEvent="liverEvent"
        />
      </div>
    </template>
  </section>
</template>
