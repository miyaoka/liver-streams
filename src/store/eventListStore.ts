import { acceptHMRUpdate, defineStore } from "pinia";
import { computed, ref } from "vue";
import { useFocusStore } from "./focusStore";
import { useStorageStore } from "./storageStore";
import { createDateSectionList } from "@/lib/section";
import { fetchLiverEventList, getFilteredEventList, type LiverEvent } from "@/services/api";
import { type NijiLiverMap } from "@/services/nijisanji";

interface AddedEvent {
  url: string;
  addedTime: number;
}

export const useEventListStore = defineStore("eventListStore", () => {
  const storageStore = useStorageStore();
  const focusStore = useFocusStore();

  const liverEventList = ref<LiverEvent[] | null>(null);
  const prevUrlSet = ref<Set<string>>(new Set());
  const addedEventList = ref<AddedEvent[]>([]);

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

  async function updateLiverEventList(nijiLiverMap: NijiLiverMap) {
    const eventList = await fetchLiverEventList({ nijiLiverMap });
    const currUrlSet = new Set(eventList.map((event) => event.url));

    // setを比較して足されたものを算出
    // 初回の場合は何もしない
    if (liverEventList.value) {
      const addedTime = Date.now();
      const diff = currUrlSet.difference(prevUrlSet.value);
      const addedItems: AddedEvent[] = Array.from(diff).map((url) => {
        return {
          url,
          addedTime,
        };
      });

      addedEventList.value.push(...addedItems);
    }

    liverEventList.value = eventList;
    prevUrlSet.value = currUrlSet;
  }

  function clearAddedEventList() {
    addedEventList.value = [];
  }

  return {
    liverEventList,
    filteredEventList,
    onLiveEventList,
    dateSectionList,
    eventUrlSet: prevUrlSet,
    liverEventMap,
    addedEventList,
    updateLiverEventList,
    clearAddedEventList,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useEventListStore, import.meta.hot));
}
