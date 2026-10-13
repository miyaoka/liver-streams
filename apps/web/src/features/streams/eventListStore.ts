import { getFilteredEventList, createDateSectionList } from "@liver-streams/core";
import type { LiverEvent } from "@liver-streams/core";
import { useMemo } from "react";
import { create } from "zustand";
import { fetchAllEvents } from "../../shared/services";
import { selectSearchQuery, useSearchStore } from "../../shared/stores";
import { processBookmarkNotification } from "../bookmark";
import { selectTalentFilterMap, useTalentFilterStore } from "../channelFilter";
import { useNewArrivalsStore } from "../newArrivals";

interface EventListState {
  liverEventList: LiverEvent[] | null;
  // idをキーにしたLiverEventのMap
  liverEventMap: Map<string, LiverEvent>;
  updateLiverEventList: () => Promise<void>;
}

export const useEventListStore = create<EventListState>()((set, get) => ({
  liverEventList: null,
  liverEventMap: new Map(),

  updateLiverEventList: async () => {
    const newLiverEventList = await fetchAllEvents();

    const eventMap = new Map<string, LiverEvent>();
    newLiverEventList.forEach((liverEvent) => {
      eventMap.set(liverEvent.id, liverEvent);
    });

    useNewArrivalsStore
      .getState()
      .updateNewArrivals(newLiverEventList, get().liverEventList, eventMap);

    set({ liverEventMap: eventMap, liverEventList: newLiverEventList });

    processBookmarkNotification(eventMap);
  },
}));

export const selectIsLoading = (state: EventListState) => state.liverEventList === null;

/** タレントフィルターと検索条件を適用したイベント一覧 */
export function useFilteredEventList(): LiverEvent[] {
  const liverEventList = useEventListStore((state) => state.liverEventList);
  const filterMap = useTalentFilterStore(selectTalentFilterMap);
  const searchQuery = useSearchStore(selectSearchQuery);

  return useMemo(() => {
    if (!liverEventList) return [];
    return getFilteredEventList({ liverEventList, filterMap, searchQuery });
  }, [liverEventList, filterMap, searchQuery]);
}

/** useFilteredEventList のうち配信中のもの */
export function useOnLiveEventList(): LiverEvent[] {
  const filteredEventList = useFilteredEventList();
  return useMemo(() => filteredEventList.filter((event) => event.isLive), [filteredEventList]);
}

/** useFilteredEventList を日付・時間で区切り、イベントのある日付だけを残したもの */
export function useDateSectionList() {
  const filteredEventList = useFilteredEventList();
  return useMemo(
    () =>
      createDateSectionList(filteredEventList).filter((dateSection) => {
        return dateSection.timeSectionList.some((section) => section.events.length > 0);
      }),
    [filteredEventList],
  );
}
