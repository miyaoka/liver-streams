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
  [0, "today"],
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

const bgColorMap: Record<string, string> = {
  0: "#0b0d33" /* 0:00 深夜の暗い青 */,
  1: "#0c1038",
  2: "#0d133d",
  3: "#0e1642",
  4: "#0f1947",
  5: "#10214d" /* 5:00 夜明け前の青 */,
  6: "#324c47" /* 6:00 夜明けの緑がかった青 */,
  7: "#507a5e" /* 7:00 朝方の緑系 */,
  8: "#78a58d" /* 8:00 朝の明るい緑 */,
  9: "#9ac4af" /* 9:00 午前の淡い緑 */,
  10: "#b5d7c8" /* 10:00 澄んだ緑 */,
  11: "#d2e9df",
  12: "#e5f6ff" /* 12:00 真昼の明るい青 */,
  13: "#cde8f5",
  14: "#b5cee2",
  15: "#9cb3c8",
  16: "#8c9db2" /* 16:00 午後の青 (修正) */,
  17: "#f2a177" /* 17:00 夕方のオレンジ */,
  18: "#ff9166" /* 18:00 日没 */,
  19: "#d86e5b" /* 19:00 夜の入り口のオレンジ */,
  20: "#824f66" /* 20:00 夜の始まりの紫系 */,
  21: "#60375b",
  22: "#452a5b",
  23: "#221848" /* 23:00 夜の深い青紫 */,
};

const sectionBgColor = computed(() => {
  const hour = new Date(time.value).getHours();
  return bgColorMap[hour.toString()];
});
</script>
<template>
  <section
    ref="sectionEl"
    :class="`flex flex-col items-center gap-[20px] pt-4`"
    :data-time="time"
    :style="{ backgroundColor: sectionBgColor }"
  >
    <template v-if="LiverEventList.length > 0">
      <div class="sticky z-20 top-4">
        <button
          :class="`font-bold px-3 py-1 rounded-full shadow-md outline outline-white outline-1 ${sectionTime.dateDiff < 0 ? 'bg-gray-200 text-gray-700' : sectionTime.dateDiff === 0 ? 'bg-gray-700 text-gray-200' : 'bg-sky-200 text-sky-700'}`"
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
