import { getFilteredEventList, createDateSectionList } from "@liver-streams/core";
import type { LiverEvent } from "@liver-streams/core";
import { acceptHMRUpdate, defineStore } from "pinia";
import { computed, ref } from "vue";
import { processBookmarkNotification } from "../features/bookmark/useBookmarkNotification";
import { useTalentFilterStore } from "../features/channelFilter/talentFilterStore";
import { useNewArrivalsStore } from "../features/newArrivals/newArrivalsStore";
import { fetchAllEvents } from "../shared/services";
import { useSearchStore } from "../shared/stores/searchStore";

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

  // ローディング状態（初回データ取得前）
  const isLoading = computed(() => liverEventList.value === null);

  const dateSectionList = computed(() => {
    return createDateSectionList(filteredEventList.value).filter((dateSection) => {
      return dateSection.timeSectionList.some((section) => section.events.length > 0);
    });
  });

  async function updateLiverEventList() {
    // list取得
    const newLiverEventList = await fetchAllEvents();

    // map更新
    const eventMap = new Map<string, LiverEvent>();
    newLiverEventList.forEach((liverEvent) => {
      eventMap.set(liverEvent.id, liverEvent);
    });
    liverEventMap.value = eventMap;

    // 新着更新
    newArrivalsStore.updateNewArrivals(newLiverEventList, liverEventList.value, eventMap);

    // list更新
    liverEventList.value = newLiverEventList;

    // bookmark通知処理
    processBookmarkNotification(eventMap);
  }

  // 後方互換性のためのエイリアス
  const addedEventList = computed(() => newArrivalsStore.newArrivalsList);
  const addedEventIdSet = computed(() => newArrivalsStore.newArrivalsIdSet);

  return {
    liverEventList,
    filteredEventList,
    onLiveEventList,
    dateSectionList,
    liverEventMap,
    addedEventList,
    addedEventIdSet,
    isLoading,
    updateLiverEventList,
    clearAddedEventList: () => newArrivalsStore.clearNewArrivals(),
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useEventListStore, import.meta.hot));
}
