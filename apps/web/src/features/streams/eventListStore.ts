import { getFilteredEventList, createDateSectionList } from "@liver-streams/core";
import type { LiverEvent } from "@liver-streams/core";
import { acceptHMRUpdate, defineStore } from "pinia";
import { computed, ref } from "vue";
import { fetchAllEvents } from "../../shared/services";
import { useSearchStore } from "../../shared/stores";
import { processBookmarkNotification } from "../bookmark";
import { useTalentFilterStore } from "../channelFilter";
import { useNewArrivalsStore } from "../newArrivals";

export const useEventListStore = defineStore("eventListStore", () => {
  const talentFilterStore = useTalentFilterStore();
  const searchStore = useSearchStore();
  const newArrivalsStore = useNewArrivalsStore();
  const liverEventList = ref<LiverEvent[] | null>(null);
  // idをキーにしたLiverEventのMap
  const liverEventMap = ref<Map<string, LiverEvent>>(new Map());

  const filteredEventList = computed(() => {
    if (!liverEventList.value) return [];
    return getFilteredEventList({
      liverEventList: liverEventList.value,
      filterMap: talentFilterStore.talentFilterMap,
      searchQuery: searchStore.searchQuery,
    });
  });

  const onLiveEventList = computed(() => {
    return filteredEventList.value.filter((event) => event.isLive);
  });

  const isLoading = computed(() => liverEventList.value === null);

  const dateSectionList = computed(() => {
    return createDateSectionList(filteredEventList.value).filter((dateSection) => {
      return dateSection.timeSectionList.some((section) => section.events.length > 0);
    });
  });

  async function updateLiverEventList() {
    const newLiverEventList = await fetchAllEvents();

    const eventMap = new Map<string, LiverEvent>();
    newLiverEventList.forEach((liverEvent) => {
      eventMap.set(liverEvent.id, liverEvent);
    });
    liverEventMap.value = eventMap;

    newArrivalsStore.updateNewArrivals(newLiverEventList, liverEventList.value, eventMap);

    liverEventList.value = newLiverEventList;

    processBookmarkNotification(eventMap);
  }

  return {
    liverEventList,
    filteredEventList,
    onLiveEventList,
    dateSectionList,
    liverEventMap,
    isLoading,
    updateLiverEventList,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useEventListStore, import.meta.hot));
}
