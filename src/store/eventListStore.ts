import { acceptHMRUpdate, defineStore } from "pinia";
import { computed, ref } from "vue";
import { useFocusStore } from "./focusStore";
import { useStorageStore } from "./storageStore";
import { createDateSectionList } from "@/lib/section";
import { fetchLiverEventList, getFilteredEventList, type LiverEvent } from "@/services/api";
import { type NijiLiverMap } from "@/services/nijisanji";

export const useEventListStore = defineStore("eventListStore", () => {
  const storageStore = useStorageStore();
  const focusStore = useFocusStore();
  const liverEventList = ref<LiverEvent[] | null>(null);

  const filteredEventList = computed(() => {
    if (!liverEventList.value) return [];
    return getFilteredEventList({
      liverEventList: liverEventList.value,
      filterMap: storageStore.talentFilterMap,
      filterEnabled: storageStore.talentFilterEnabled,
      searchTerms: storageStore.searchTerms,
      focusedTalent: focusStore.focusedTalent,
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

  return {
    liverEventList,
    filteredEventList,
    onLiveEventList,
    dateSectionList,
    updateLiverEventList,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useEventListStore, import.meta.hot));
}
