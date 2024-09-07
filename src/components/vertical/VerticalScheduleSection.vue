<script setup lang="ts">
import { computed, ref } from "vue";
import VerticalScheduleSectionItem from "./VerticalScheduleSectionItem.vue";
import type { VideoDetailWithTime } from "./VerticalSchedule.vue";
import { useDateStore } from "@/store/dateStore";

const props = defineProps<{
  section: [string, VideoDetailWithTime[]];
  nextSection: [string, VideoDetailWithTime[]] | undefined;
}>();

const dateStore = useDateStore();

const time = computed(() => Number(props.section[0]));
const nextTime = computed(() => (props.nextSection ? Number(props.nextSection[0]) : Infinity));
const videoList = computed(() => props.section[1]);
const isCurrent = computed(() => {
  const now = dateStore.date.getTime();
  return now >= time.value && now < nextTime.value;
});
const isPast = computed(() => {
  const now = dateStore.date.getTime();
  return now > time.value;
});

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

const sectionEl = ref<HTMLElement | null>(null);

function sectionTime(time: number) {
  const date = new Date(time);

  const str = dateFormatter.format(date);
  return str;
}
function scrollToSectionTop() {
  if (!sectionEl.value) return;
  sectionEl.value.scrollIntoView({ behavior: "smooth" });
}
</script>
<template>
  <section
    ref="sectionEl"
    :class="`flex flex-col items-center gap-[20px]  pt-4 ${isCurrent ? 'bg-yellow-100' : isPast ? 'bg-gray-200' : 'bg-sky-100'}`"
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
      class="max-w-full grid grid-cols-[repeat(auto-fill,560px)] gap-x-[16px] gap-y-[28px] px-4 py-8 max-xl:grid-cols-[repeat(auto-fit,minmax(480px,1fr))] max-sm:grid-cols-[repeat(auto-fit,minmax(320px,1fr))] max-sm:px-2"
    >
      <VerticalScheduleSectionItem
        v-for="item in videoList"
        :key="(Array.isArray(item) ? item[0] : item).url"
        :video="item"
      />
    </div>
  </section>
</template>
