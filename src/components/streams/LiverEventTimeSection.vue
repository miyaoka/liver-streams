<script setup lang="ts">
import { computed, ref } from "vue";
import LiverEventCard from "./LiverEventCard.vue";
import type { TimeSection } from "@/lib/section";

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
    class="flex min-h-2 scroll-m-8 flex-col items-center gap-[20px]"
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
        <p>now</p>
      </div>
    </div>
    <template v-if="hasEvents">
      <div
        class="grid w-full grid-cols-[repeat(auto-fill,minmax(410px,1fr))] gap-x-[clamp(2px,2px+0.5vw,12px)] gap-y-[28px] px-[clamp(2px,2px+0.5vw,16px)] py-8 max-xl:grid-cols-[repeat(auto-fill,minmax(360px,1fr))]"
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
