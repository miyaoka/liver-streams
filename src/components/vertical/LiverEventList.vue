<script setup lang="ts">
import { useEventListener } from "@vueuse/core";
import { computed, nextTick, onMounted, ref, watch } from "vue";
import LiverEventSection, { type Section } from "./LiverEventSection.vue";
import type { LiverEvent } from "@/api";
import { useDateStore } from "@/store/dateStore";
import { useStorageStore } from "@/store/storageStore";
import { useTalentStore } from "@/store/talentStore";

const props = defineProps<{
  liverEventList: LiverEvent[];
}>();

const channelFilterStore = useStorageStore();
const talentStore = useTalentStore();
const sectionList = ref<Section[]>([]);

const dateStore = useDateStore();

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

function getFilteredEventList(
  filterMap: Map<string, boolean>,
  filterEnabled: boolean,
  liverEventList: LiverEvent[],
  searchTerms: string[],
  focusedTalent: string | null,
  isLiveOnly: boolean,
): LiverEvent[] {
  // 単一セレクト時
  if (focusedTalent) {
    return liverEventList.filter((video) => {
      return (
        video.talent.name === focusedTalent ||
        video.collaboTalents.some((collaborator) => {
          return collaborator.name === focusedTalent;
        })
      );
    });
  }

  const hasTalentfilter = filterEnabled && filterMap.size > 0;
  // 検索語をスペースで分割してOR検索
  const searchRegExp = searchTerms.length > 0 ? new RegExp(searchTerms.join("|"), "i") : null;

  return (
    liverEventList
      // talentでフィルタリング
      .filter((video) => {
        // フィルタなし
        if (!hasTalentfilter) return true;

        // タレント名かコラボタレント名がフィルターに含まれる動画のみ表示
        return (
          filterMap.has(video.talent.name) ||
          video.collaboTalents.some((collaborator) => {
            return filterMap.has(collaborator.name);
          })
        );
      })
      .filter((video) => {
        // live中のみ表示
        if (!isLiveOnly) return true;
        return video.isLive;
      })
      .filter((video) => {
        // 検索語にマッチしたイベントのみ表示
        if (!searchRegExp) return true;
        return (
          searchRegExp.test(video.title) ||
          searchRegExp.test(video.talent.name) ||
          video.collaboTalents.some((collaborator) => {
            return searchRegExp.test(collaborator.name);
          })
        );
      })
  );
}

function createSectionList(liverEventList: LiverEvent[]): Section[] {
  const sectionList: Section[] = [];
  if (liverEventList.length === 0) return [];
  const firstEvent = liverEventList[0];
  const lastEvent = liverEventList[liverEventList.length - 1];

  function getSectionTime(date: Date) {
    const hour = date.getHours();
    return new Date(date).setHours(hour, 0, 0, 0);
  }

  const firstSectionTime = getSectionTime(firstEvent.startAt);
  const lastSectionTime = getSectionTime(lastEvent.startAt);
  const oneHour = 3600000;

  for (let time = firstSectionTime; time <= lastSectionTime; time += oneHour) {
    const events = liverEventList.filter((event) => {
      const eventTime = getSectionTime(event.startAt);
      return eventTime === time;
    });

    sectionList.push({ time, events });
  }

  return sectionList;
}

const searchTerms = computed(() => {
  return channelFilterStore.searchTerm.split(/\s+/).filter((term) => term !== "");
});

const filteredEventList = computed(() => {
  return getFilteredEventList(
    channelFilterStore.talentFilterMap,
    channelFilterStore.talentFilterEnabled,
    props.liverEventList,
    searchTerms.value,
    talentStore.focusedTalent,
    channelFilterStore.isLiveOnly,
  );
});

watch(
  filteredEventList,
  async (list) => {
    sectionList.value = createSectionList(list);

    await nextTick();
    currentTimeTop.value = getCurrentTop(dateStore.date);
  },
  { immediate: true, deep: true },
);

const currentTimeTop = ref<number | null>(null);

function getCurrentTop(date: Date) {
  const time = date.getTime();
  // 現在時刻の直後のイベントを探す
  let currentEvent = filteredEventList.value.find((liverEvent) => {
    const eventTime = liverEvent.startAt.getTime();
    if (eventTime > time) {
      return liverEvent;
    }
  });

  if (!currentEvent) return null;
  const currentEventEl = document.querySelector(`a[href="${currentEvent.url}"]`);
  if (!currentEventEl) return null;

  const currentEventRect = currentEventEl.getBoundingClientRect();
  return currentEventRect.top + window.scrollY;
}

let resizeTimeout: number | null = null;

// window resize時にcurrentTimeTopを再計算
useEventListener("resize", () => {
  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
  }

  // resize終了時に再計算
  resizeTimeout = window.setTimeout(() => {
    currentTimeTop.value = getCurrentTop(dateStore.date);
  }, 100);
});

watch(
  () => dateStore.date,
  (date) => {
    currentTimeTop.value = getCurrentTop(date);
  },
);
</script>
<template>
  <div v-if="sectionList.length > 0" class="min-h-screen pb-60 bg-[#2a2c5d]">
    <LiverEventSection
      v-for="(section, i) in sectionList"
      :key="section.time"
      :section="section"
      :nextSection="sectionList[i + 1]"
    />
    <div
      v-if="currentTimeTop !== null"
      class="absolute w-full z-10 pointer-events-none"
      :style="{ top: currentTimeTop + 'px' }"
    >
      <div class="absolute -top-[24px] w-full flex flex-col items-center">
        <div class="bg-sky-500 bg-opacity-100 w-full h-[10px] text-center shadow-lg"></div>
        <p class="text-base font-bold bg-sky-500 text-white px-2 -mt-2 rounded-b-xl">now</p>
      </div>
    </div>
  </div>
  <div
    v-else
    class="px-4 py-20 flex flex-col h-screen items-center justify-center bg-gradient-to-b from-zinc-200 to-white"
  >
    <i class="i-mdi-file-document-error w-16 h-16 text-zinc-400" />
    <p class="text-base font-bold text-zinc-400">no data</p>
  </div>
</template>
