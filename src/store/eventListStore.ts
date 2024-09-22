import { acceptHMRUpdate, defineStore } from "pinia";
import { computed, ref } from "vue";
import { useFocusStore } from "./focusStore";
import { useStorageStore } from "./storageStore";
import { createDateSectionList } from "@/lib/section";
import {
  compareLiverEvent,
  fetchLiverEventList,
  getFilteredEventList,
  type LiverEvent,
} from "@/services/api";
import { type NijiLiverMap } from "@/services/nijisanji";

export const useEventListStore = defineStore("eventListStore", () => {
  const storageStore = useStorageStore();
  const focusStore = useFocusStore();

  const liverEventList = ref<LiverEvent[] | null>(null);
  const eventUrlSet = ref<Set<string>>(new Set());
  const addedUrlSet = ref<Set<string>>(new Set());

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

  // urlをキーにしたLiverEventのMap
  const liverEventMap = computed(() => {
    const map = new Map<string, LiverEvent>();
    if (!liverEventList.value) return map;
    liverEventList.value.forEach((liverEvent) => {
      map.set(liverEvent.url, liverEvent);
    });
    return map;
  });

  const newEventList = computed(() => {
    const eventList: LiverEvent[] = [];
    addedUrlSet.value.forEach((url) => {
      const event = liverEventMap.value.get(url);
      if (!event) return;
      eventList.push(event);
    });
    return eventList.sort(compareLiverEvent);
  });

  async function updateLiverEventList(nijiLiverMap: NijiLiverMap) {
    const eventList = await fetchLiverEventList({ nijiLiverMap });
    const currUrlSet = new Set(eventList.map((event) => event.url));

    // setを比較して足されたものを算出
    // 初回の場合は何もしない
    if (liverEventList.value) {
      addedUrlSet.value = currUrlSet.difference(eventUrlSet.value);
    }

    liverEventList.value = eventList;
    eventUrlSet.value = currUrlSet;
  }

  return {
    liverEventList,
    filteredEventList,
    onLiveEventList,
    dateSectionList,
    eventUrlSet,
    addedUrlSet,
    liverEventMap,
    newEventList,
    updateLiverEventList,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useEventListStore, import.meta.hot));
}
