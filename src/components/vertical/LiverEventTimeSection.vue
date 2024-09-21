<script setup lang="ts">
import { computed, ref } from "vue";
import LiverEventCard from "./LiverEventCard.vue";
import type { TimeSection } from "@/store/eventListStore";

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

const sectionEl = ref<HTMLElement | null>(null);

const hasEvents = computed(() => props.section.events.length > 0);
const sectionColor = computed(() => {
  const hour = new Date(props.section.time).getHours();
  return hourColorMap.get(hour);
});

const nextSectionColor = computed(() => {
  if (!props.nextSection) return hourColorMap.get(0);
  const nextHour = new Date(props.nextSection.time).getHours();
  return hourColorMap.get(nextHour);
});

const sectionBackground = computed(() => {
  // イベントがあればグラデーションで繋ぎ、なければ単色
  if (hasEvents.value) {
    return `linear-gradient(${sectionColor.value}, ${nextSectionColor.value})`;
  }
  return sectionColor.value;
});
</script>
<template>
  <section
    ref="sectionEl"
    class="flex flex-col items-center gap-[20px] pt-0 min-h-2"
    :data-time="props.section.time"
    :style="{
      background: sectionBackground,
    }"
  >
    <template v-if="hasEvents">
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
