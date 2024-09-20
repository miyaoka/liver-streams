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
  [0, "#1a1c4d"],
  [1, "#1b1f52"],
  [2, "#1c2257"],
  [3, "#1d255c"],
  [4, "#1e2861"],
  [5, "#1f3067"],
  [6, "#4a6a64"],
  [7, "#678a7b"],
  [8, "#90b5aa"],
  [9, "#b2d4cc"],
  [10, "#cde7e5"],
  [11, "#e2f4f3"],
  [12, "#f5fcff"],
  [13, "#dfeff9"],
  [14, "#c9d5e6"],
  [15, "#b2bbcc"],
  [16, "#a2a5b6"],
  [17, "#f7b89a"],
  [18, "#ffb188"],
  [19, "#e08e7d"],
  [20, "#9a6f88"],
  [21, "#78577d"],
  [22, "#5d4a7d"],
  [23, "#3a386a"],
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
