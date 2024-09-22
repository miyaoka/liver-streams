import { acceptHMRUpdate, defineStore } from "pinia";
import { computed, ref } from "vue";
import { useStorageStore } from "./storageStore";
import { useTalentStore } from "./talentStore";
import { fetchLiverEventList, getFilteredEventList, type LiverEvent } from "@/api";
import { type NijiLiverMap } from "@/api/nijisanji/nijisanji";
import { createDateSectionList } from "@/lib/section";

export const useEventListStore = defineStore("eventListStore", () => {
  const storageStore = useStorageStore();
  const talentStore = useTalentStore();
  const liverEventList = ref<LiverEvent[] | null>(null);

  const filteredEventList = computed(() => {
    if (!liverEventList.value) return [];
    return getFilteredEventList({
      liverEventList: liverEventList.value,
      filterMap: storageStore.talentFilterMap,
      filterEnabled: storageStore.talentFilterEnabled,
      searchTerms: storageStore.searchTerms,
      focusedTalent: talentStore.focusedTalent,
      isLiveOnly: storageStore.isLiveOnly,
    });
  });

  const onLiveEventList = computed(() => {
    return filteredEventList.value.filter((event) => event.isLive);
  });

  const dateSectionList = computed(() => {
    return createDateSectionList(filteredEventList.value).filter((dateSection) => {
      return dateSection.timeSectionList.some((section) => section.events.length > 0);
    });
  });

  function updateLiverEventList(nijiLiverMap: NijiLiverMap) {
    fetchLiverEventList({ nijiLiverMap }).then((events) => {
      liverEventList.value = events;
    });
  }

  function scrollToCurrentTime(option: ScrollIntoViewOptions = { behavior: "smooth" }) {
    const now = Date.now();
    // dateSection内のtimeSectionをflat化
    const timeSectionList = dateSectionList.value.flatMap((section) => section.timeSectionList);
    // 現在時刻より後のtimeSectionを取得
    const afterNowIndex = timeSectionList.findIndex((timeSection) => timeSection.time > now);

    // 現在より後のsectionがあればその手前、またはそのsection
    // 現在より後が無ければイベントが有る最後のsection
    const targetTimeSection =
      afterNowIndex > 0
        ? (timeSectionList[afterNowIndex - 1] ?? timeSectionList[afterNowIndex])
        : timeSectionList.filter((timeSection) => timeSection.events.length > 0).at(-1);

    if (!targetTimeSection) return;

    const target = document.querySelector(
      `[data-id="time-section"][data-time="${targetTimeSection.time}"]`,
    );
    if (!target) return;

    target.scrollIntoView(option);
  }

  return {
    liverEventList,
    filteredEventList,
    onLiveEventList,
    dateSectionList,
    updateLiverEventList,
    scrollToCurrentTime,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useEventListStore, import.meta.hot));
}
