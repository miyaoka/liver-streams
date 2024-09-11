<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useStorageStore } from "../../store/storageStore";
import VerticalScheduleColumn from "./VerticalScheduleColumn.vue";
import type { LiverEvent } from "@/api";
import { useTalentStore } from "@/store/talentStore";

const props = defineProps<{
  liverEventList: LiverEvent[];
}>();

const channelFilterStore = useStorageStore();
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
  const searchRegExp = new RegExp(searchTerm, "i");
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
        if (searchTerm === "") return true;
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
    () => channelFilterStore.talentFilterMap,
    () => channelFilterStore.talentFilterEnabled,
    () => channelFilterStore.searchTerm,
    () => talentStore.focusedTalent,
    () => channelFilterStore.isLiveOnly,
  ],
  ([liverEventList, filterMap, filterEnabled, searchTerm, focusedTalent, isLiveOnly]) => {
    sectionMap.value = createSectionMap(
      getFilteredData(
        filterMap,
        filterEnabled,
        liverEventList,
        searchTerm,
        focusedTalent,
        isLiveOnly,
      ),
    );
  },
  { immediate: true, deep: true },
);
</script>
<template>
  <VerticalScheduleColumn v-if="Object.keys(sectionMap).length > 0" :sectionMap="sectionMap" />
  <div v-else>no data</div>
</template>
