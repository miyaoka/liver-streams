<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useChannelFilterStore } from "../filter/channelFilterStore";
import VerticalScheduleColumn from "./VerticalScheduleColumn.vue";
import type { LiverEvent } from "@/api";
import { useTalentStore } from "@/store/talentStore";
import { getChannelIcon } from "@/utils/icons";

const props = defineProps<{
  liverEventList: LiverEvent[];
}>();

const channelFilterStore = useChannelFilterStore();
const talentStore = useTalentStore();
const sectionMap = ref<Record<number, LiverEvent[]>>({});
const hourSections = [23, 22, 21, 20, 19, 18, 12, 6, 0];

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

function getFilteredData(
  filterMap: Map<string, boolean>,
  filterEnabled: boolean,
  liverEventList: LiverEvent[],
  searchTerm: string,
  focusedTalent: string | null,
): LiverEvent[] {
  if (searchTerm !== "") {
    const searchRegExp = new RegExp(searchTerm, "i");
    return liverEventList.filter((video) => {
      return (
        searchRegExp.test(video.title) ||
        searchRegExp.test(video.talent.name) ||
        video.collaboTalents.some((collaborator) => {
          return searchRegExp.test(collaborator.name);
        })
      );
    });
  }

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
  // フィルタなし
  if (!filterEnabled || filterMap.size === 0) return liverEventList;

  // タレント名かコラボタレント名がフィルターに含まれる動画のみ表示
  return liverEventList.filter((video) => {
    return (
      filterMap.has(video.talent.name) ||
      video.collaboTalents.some((collaborator) => {
        return filterMap.has(collaborator.name);
      })
    );
  });
}

function createSectionMap(liverEventList: LiverEvent[]): Record<number, LiverEvent[]> {
  const sectionVideoList: Record<number, LiverEvent[]> = {};

  liverEventList.forEach((liverEvent) => {
    const hour = liverEvent.startAt.getHours();
    // 区切った時間に丸める
    const sectionHour = hourSections.find((sectionHour) => hour >= sectionHour) ?? 0;
    const sectionTime = new Date(liverEvent.startAt).setHours(sectionHour, 0, 0, 0);

    if (!sectionVideoList[sectionTime]) {
      sectionVideoList[sectionTime] = [];
    }
    sectionVideoList[sectionTime].push(liverEvent);
  });

  return sectionVideoList;
}

watch(
  [
    () => props.liverEventList,
    () => channelFilterStore.map,
    () => channelFilterStore.enabled,
    () => channelFilterStore.searchTerm,
    () => talentStore.focusedTalent,
  ],
  ([liverEventList, filterMap, filterEnabled, searchTerm, focusedTalent]) => {
    sectionMap.value = createSectionMap(
      getFilteredData(filterMap, filterEnabled, liverEventList, searchTerm, focusedTalent),
    );
  },
  { immediate: true, deep: true },
);
</script>
<template>
  <VerticalScheduleColumn v-if="Object.keys(sectionMap).length > 0" :sectionMap="sectionMap" />
  <div v-else>no data</div>
  <button
    v-if="talentStore.focusedTalent != null"
    class="selected fixed inset-0 bottom-4 m-auto top-auto w-fit h-fit z-20 flex flex-row justify-center items-center gap-4 px-4 py-1 rounded-full shadow-md bg-blue-800 text-white outline outline-white"
    @click="talentStore.setFocusedTalent(null)"
  >
    focused:
    <img
      :src="getChannelIcon(talentStore.focusedTalent)"
      loading="lazy"
      class="rounded-full w-[44px]"
    />
    {{ talentStore.focusedTalent }}

    <div class="i-mdi-cross-circle w-[32px] h-[32px]" />
  </button>
</template>

<style scoped>
.selected {
  transition: all 0.3s;
  @starting-style {
    opacity: 0;
    translate: 0 100px;
  }
}
</style>
