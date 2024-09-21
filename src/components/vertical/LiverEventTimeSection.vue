<script setup lang="ts">
import { computed, ref } from "vue";
import LiverEventCard from "./LiverEventCard.vue";
import type { TimeSection } from "@/store/eventListStore";

const props = defineProps<{
  section: TimeSection;
  nextSection: TimeSection | undefined;
  isCurrentTime: boolean;
}>();

const sectionEl = ref<HTMLElement | null>(null);

const hasEvents = computed(() => props.section.events.length > 0);
const sectionColor = computed(() => {
  const hour = new Date(props.section.time).getHours();
  return getTimeColor(hour);
});

const nextSectionColor = computed(() => {
  if (!props.nextSection) return getTimeColor(0);
  const nextHour = new Date(props.nextSection.time).getHours();
  return getTimeColor(nextHour);
});

const sectionBackground = computed(() => {
  // イベントがあればグラデーションで繋ぎ、なければ単色
  // if (hasEvents.value) {
  //   return `linear-gradient(${sectionColor.value}, ${nextSectionColor.value})`;
  // }
  return sectionColor.value;
});

function getTimeColor(hour: number) {
  return "var(--hour" + hour + ")";
}
</script>
<template>
  <section
    ref="sectionEl"
    class="flex flex-col items-center gap-[20px] min-h-2 scroll-m-8"
    data-id="time-section"
    :data-time="props.section.time"
    :style="{
      background: sectionBackground,
    }"
  >
    <div v-if="isCurrentTime" class="w-full pointer-events-none flex">
      <div
        class="bg-black bg-opacity-70 text-white mt-8 pl-2 pr-12 [clip-path:polygon(0%_0%,85%_0%,100%_45%,100%_55%,85%_100%,0%_100%);] font-bold text-base flex items-center gap-2 py-1"
      >
        <i class="i-mdi-clock-outline h-6 w-6" />
        <p>now</p>
      </div>
    </div>
    <template v-if="hasEvents">
      <div
        class="w-full grid grid-cols-[repeat(auto-fill,minmax(410px,1fr))] gap-y-[28px] pt-8 pb-8 max-xl:grid-cols-[repeat(auto-fill,minmax(360px,1fr))] px-[clamp(2px,2px+0.5vw,16px)] gap-x-[clamp(2px,2px+0.5vw,12px)]"
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
