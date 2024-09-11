<script setup lang="ts">
import { computed, ref } from "vue";
import LiverEventCard from "./LiverEventCard.vue";
import type { LiverEvent } from "@/api";
import { useDateStore } from "@/store/dateStore";
import { mmddhhssDateFormatter } from "@/utils/dateFormat";

const props = defineProps<{
  section: [number, LiverEvent[]];
  nextSection: [number, LiverEvent[]] | undefined;
}>();

const dateStore = useDateStore();

const time = computed(() => {
  return props.section[0];
});
const nextTime = computed(() => (props.nextSection ? props.nextSection[0] : Infinity));
const LiverEventList = computed(() => props.section[1]);
const isCurrent = computed(() => {
  const now = dateStore.date.getTime();
  return now >= time.value && now < nextTime.value;
});
const isPast = computed(() => {
  const now = dateStore.date.getTime();
  return now > time.value;
});

const sectionEl = ref<HTMLElement | null>(null);

function sectionTime(time: number) {
  return mmddhhssDateFormatter.format(time);
}
function scrollToSectionTop() {
  if (!sectionEl.value) return;
  sectionEl.value.scrollIntoView({ behavior: "smooth" });
}
</script>
<template>
  <section
    ref="sectionEl"
    :class="`flex flex-col items-center gap-[20px] pt-4 ${isCurrent ? 'bg-yellow-100' : isPast ? 'bg-gray-200' : 'bg-sky-100'}`"
    :data-time="time"
  >
    <div class="sticky z-20 top-4">
      <button
        :class="` text-gray-100 font-bold px-3 py-1 rounded-full shadow-md outline outline-white outline-1 ${isCurrent ? 'bg-red-600' : 'bg-slate-700'}`"
        @click="scrollToSectionTop"
      >
        {{ sectionTime(time) }}
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
  </section>
</template>
