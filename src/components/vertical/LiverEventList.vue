<script setup lang="ts">
import { computed, onMounted } from "vue";
import LiverEventDateSection from "./LiverEventDateSection.vue";
import { type TimeSection } from "./LiverEventTimeSection.vue";
import type { DateSection } from "./LiverEventDateSection.vue";
import type { LiverEvent } from "@/api";

const props = defineProps<{
  liverEventList: LiverEvent[];
}>();

const dateSectionList = computed<DateSection[]>(() => {
  return createDateSectionList(props.liverEventList);
});

function createDateSectionList(liverEventList: LiverEvent[]): DateSection[] {
  if (liverEventList.length === 0) return [];
  const firstEvent = liverEventList[0];
  const lastEvent = liverEventList[liverEventList.length - 1];

  function getHourTime(date: Date): number {
    const hour = date.getHours();
    return new Date(date).setHours(hour, 0, 0, 0);
  }

  function getDateTime(date: Date): number {
    return new Date(date).setHours(0, 0, 0, 0);
  }

  const oneHour = 3600000;
  const oneDay = 86400000;
  const firstDateTime = getDateTime(firstEvent.startAt);
  const lastDateTime = getDateTime(lastEvent.startAt) + oneDay;

  // 時間ごとにイベントをグループ化
  const liverEventMap = new Map<number, LiverEvent[]>();
  liverEventList.forEach((event) => {
    const time = getHourTime(event.startAt);
    if (!liverEventMap.has(time)) {
      liverEventMap.set(time, []);
    }
    liverEventMap.get(time)?.push(event);
  });

  const dateSectionList: DateSection[] = [];

  // 最初の日から最後の日まで1時間ずつセクションを作成し、該当するイベントをセクションに追加
  for (let time = firstDateTime; time < lastDateTime; time += oneDay) {
    const timeSectionList: TimeSection[] = [];

    for (let i = 0; i < 24; i++) {
      const hourTime = time + i * oneHour;
      const events = liverEventMap.get(hourTime) || [];

      timeSectionList.push({
        time: hourTime,
        events,
      });
    }
    dateSectionList.push({
      time,
      date: new Date(time),
      timeSectionList,
    });
  }

  // イベントがある日のみに絞り込む
  return dateSectionList.filter((dateSection) => {
    return dateSection.timeSectionList.some((section) => section.events.length > 0);
  });
}

onMounted(() => {
  const now = Date.now();
  const sections = [...document.querySelectorAll("section[data-time]")];
  const sectionIndex = sections.findIndex((el) => {
    const time = Number(el.getAttribute("data-time"));
    // 現在時刻を超える最初のセクションを探す
    if (time > now) return true;
  });
  // 現在時刻の直前のセクション
  const prevSection = sections[sectionIndex - 1];

  if (prevSection) {
    // セクションにスクロール
    prevSection.scrollIntoView({ behavior: "instant", block: "start" });
  }
});
</script>
<template>
  <div class="min-h-screen pb-60 bg-[#3a3c6d]" v-if="props.liverEventList.length > 0">
    <LiverEventDateSection
      v-for="(dateSection, i) in dateSectionList"
      :key="dateSection.time"
      :dateSection="dateSection"
      :prevSection="dateSectionList[i - 1]"
      :nextSection="dateSectionList[i + 1]"
    />
  </div>
  <div
    v-else
    class="px-4 py-20 flex flex-col h-screen items-center justify-center bg-gradient-to-b from-zinc-200 to-white"
  >
    <i class="i-mdi-file-document-error w-16 h-16 text-zinc-400" />
    <p class="text-base font-bold text-zinc-400">no data</p>
  </div>
</template>
