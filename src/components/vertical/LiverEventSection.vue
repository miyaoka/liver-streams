<script setup lang="ts">
import { computed, ref } from "vue";
import LiverEventCard from "./LiverEventCard.vue";
import type { LiverEvent } from "@/api";
import { useDateStore } from "@/store/dateStore";
import { hhss } from "@/utils/dateFormat";

export interface TimeSection {
  time: number;
  events: LiverEvent[];
}
const props = defineProps<{
  section: TimeSection;
  nextSection: TimeSection | undefined;
}>();

const hourColorMap = new Map<number, string>([
  [0, "#3a3c6d"],
  [1, "#3a3e70"],
  [2, "#3b4064"],
  [3, "#3c4368"],
  [4, "#3d466c"],
  [5, "#3e4970"],
  [6, "#4a5a7d"], // sunrise
  [7, "#c0d8e0"], // morning
  [8, "#c4dce4"],
  [9, "#c8e0e8"],
  [10, "#cce4ec"],
  [11, "#d0e8f0"],
  [12, "#d4ecf4"], // noon (brighter)
  [13, "#d0e8f0"],
  [14, "#cce4ec"],
  [15, "#c8e0e8"],
  [16, "#c4dce4"],
  [17, "#c0d8e0"], // evening
  [18, "#e4b4b0"], // sunset transition (red hue)
  [19, "#e49894"], // sunset (red hue)
  [20, "#b08080"], // post-sunset (red hue)
  [21, "#606080"],
  [22, "#505070"],
  [23, "#3a3c6d"],
]);
const dateMap = new Map<number, string>([
  [0, "today"],
  [-1, "yesterday"],
  [1, "tomorrow"],
]);

const dateStore = useDateStore();
const sectionEl = ref<HTMLElement | null>(null);

const sectionBgColor = computed(() => {
  const hour = new Date(props.section.time).getHours();
  return hourColorMap.get(hour);
});

const nextSectionBgColor = computed(() => {
  if (!props.nextSection) return hourColorMap.get(0);
  const nextHour = new Date(props.nextSection.time).getHours();
  return hourColorMap.get(nextHour);
});

const sectionDate = computed(() => {
  return new Date(props.section.time);
});

const sectionInfo = computed(() => {
  const dateDiff = compareDate(dateStore.date, sectionDate.value);

  return {
    dateDiff,
    dateLabel: dateMap.get(dateDiff),
    hhss: hhss(sectionDate.value),
  };
});

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

function scrollToSectionTop() {
  if (!sectionEl.value) return;
  sectionEl.value.scrollIntoView({ behavior: "smooth" });
}
</script>
<template>
  <section
    ref="sectionEl"
    class="flex flex-col items-center gap-[20px] pt-4 min-h-6"
    :data-time="props.section.time"
    :style="{ background: `linear-gradient(${sectionBgColor}, ${nextSectionBgColor})` }"
  >
    <template v-if="props.section.events.length > 0">
      <div class="sticky z-20 top-4">
        <button
          :class="`font-bold px-3 py-1 rounded-full shadow-md outline outline-white outline-1 ${sectionInfo.dateDiff < 0 ? 'bg-gray-700 text-gray-400' : sectionInfo.dateDiff === 0 ? 'bg-gray-800 text-white' : 'bg-gray-500 text-gray-100'}`"
          @click="scrollToSectionTop"
        >
          {{ sectionInfo.dateLabel }} {{ sectionInfo.hhss }}
        </button>
      </div>
      <div
        class="w-full grid grid-cols-[repeat(auto-fill,minmax(440px,1fr))] gap-y-[28px] py-8 max-xl:grid-cols-[repeat(auto-fill,minmax(360px,1fr))] px-[clamp(2px,2px+0.5vw,16px)] gap-x-[clamp(2px,2px+0.5vw,12px)]"
      >
        <LiverEventCard
          v-for="liverEvent in props.section.events"
          :key="liverEvent.url"
          :liverEvent="liverEvent"
        />
      </div>
    </template>
  </section>
</template>
