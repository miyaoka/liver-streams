<script setup lang="ts">
import { computed, ref } from "vue";
import LiverEventCard from "./LiverEventCard.vue";
import type { TimeSection } from "@/lib/section";
import { useDateStore } from "@/store/dateStore";
import { hhmmDateFormatter } from "@/utils/dateFormat";

const props = defineProps<{
  section: TimeSection;
  nextSection: TimeSection | undefined;
  isCurrentTime: boolean;
}>();

const dateStore = useDateStore();

const sectionEl = ref<HTMLElement | null>(null);

const hasEvents = computed(() => props.section.events.length > 0);
const hour = computed(() => new Date(props.section.time).getHours());
const sectionColor = computed(() => {
  return getTimeColor(hour.value);
});

const sectionBackground = computed(() => {
  // イベントがあればグラデーションで繋ぎ、なければ単色
  // if (hasEvents.value) {
  //   return `linear-gradient(${sectionColor.value}, ${nextSectionColor.value})`;
  // }
  return sectionColor.value;
});

const hhss = computed(() => {
  return hhmmDateFormatter.format(dateStore.currentTime);
});

function getTimeColor(hour: number) {
  return "var(--hour" + hour + ")";
}
</script>
<template>
  <section
    ref="sectionEl"
    class="flex scroll-m-8 flex-col items-center gap-[20px] pt-3"
    data-id="time-section"
    :data-time="props.section.time"
    :style="{
      background: sectionBackground,
    }"
  >
    <div v-if="isCurrentTime" class="pointer-events-none flex w-full">
      <div
        class="mt-8 flex select-none items-center gap-2 bg-black/70 py-1 pl-2 pr-12 text-base font-bold text-white [clip-path:polygon(0%_0%,85%_0%,100%_45%,100%_55%,85%_100%,0%_100%);]"
      >
        <i class="i-mdi-clock-outline size-6" />
        <p>now {{ hhss }}</p>
      </div>
    </div>
    <template v-if="hasEvents">
      <div
        class="pointer-events-none flex w-full select-none items-baseline justify-start gap-[2px] px-[clamp(2px,2px+0.5vw,16px)] font-['Poppins'] font-bold leading-none text-gray-800/30"
      >
        <span class="text-5xl tracking-tight drop-shadow-md">
          {{ hour.toFixed(0).padStart(2, "0") }}
        </span>
        <span class="text-3xl drop-shadow-md">:00</span>
      </div>
      <div
        class="grid w-full grid-cols-[repeat(auto-fill,minmax(410px,1fr))] gap-x-[clamp(2px,2px+0.5vw,12px)] gap-y-[28px] px-[clamp(2px,2px+0.5vw,16px)] pb-8 max-xl:grid-cols-[repeat(auto-fill,minmax(360px,1fr))]"
      >
        <TransitionGroup name="card">
          <LiverEventCard
            v-for="liverEvent in props.section.events"
            :key="liverEvent.id"
            :liverEvent="liverEvent"
          />
        </TransitionGroup>
      </div>
    </template>
  </section>
</template>

<style scoped>
.card-move {
  transition: all 0.4s ease;
}
.card-enter-active {
  transition: all 0.5s cubic-bezier(0.68, -0.55, 0.27, 2.55);
}
.card-leave-active {
  display: none;
}

.card-enter-from {
  opacity: 0;
  scale: 0.8;
  translate: 0 50%;
}

.card-leave-active {
  position: absolute;
}
</style>
