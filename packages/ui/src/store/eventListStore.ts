import {
  getFilteredEventList,
  createDateSectionList,
  compareLiverEvent,
} from "@liver-streams/core";
import type { LiverEvent } from "@liver-streams/core";
import { acceptHMRUpdate, defineStore } from "pinia";
import { computed, ref } from "vue";
import { processBookmarkNotification } from "../features/bookmark/useBookmarkNotification";
import { useTalentFilterStore } from "../features/channelFilter/talentFilterStore";
import { useNewArrivalsStore } from "../features/newArrivals/newArrivalsStore";
import { services } from "../shared/services";
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
    const prevList = liverEventList.value;

    // 各サービスを並列で開始し、失敗したサービスは空配列として扱う
    const promises = services.map(async (service) => {
      try {
        return await service.fetchEventList();
      } catch {
        return [];
      }
    });

    // サービス結果を蓄積し、完了するたびに画面を更新する
    const serviceResults: LiverEvent[][] = [];
    let merged: LiverEvent[] = [];
    for (const promise of promises) {
      const result = await promise;
      serviceResults.push(result);

      merged = serviceResults.flat().sort(compareLiverEvent);

      // map更新
      const eventMap = new Map<string, LiverEvent>();
      merged.forEach((e) => eventMap.set(e.id, e));
      liverEventMap.value = eventMap;

      // list更新（即座に画面反映）
      liverEventList.value = merged;
    }

    // 全サービス完了後: 新着更新
    newArrivalsStore.updateNewArrivals(merged, prevList, liverEventMap.value);

    // 全サービス完了後: bookmark通知処理
    processBookmarkNotification(liverEventMap.value);
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
