import type { LiverEvent } from "@liver-streams/core";
import { talentFilter } from "@liver-streams/core";
import { useMemo } from "react";
import { create } from "zustand";
import { createMemoSelector } from "../../shared/lib";
import { selectTalentFilterMap, useTalentFilterStore } from "../channelFilter";

interface NewArrivalId {
  id: string;
  addedTime: number;
}

interface NewArrival {
  addedTime: number;
  liverEvent: LiverEvent;
}

// 新着としてキープする時間(ms)
const newArrivalsKeepTime = 1000 * 60 * 60 * 2;

interface NewArrivalsState {
  newArrivalsIdList: NewArrivalId[];
  // eventListStore の liverEventMap への参照
  liverEventMap: Map<string, LiverEvent>;
  updateNewArrivals: (
    newLiverEventList: LiverEvent[],
    prevLiverEventList: LiverEvent[] | null,
    liverEventMap: Map<string, LiverEvent>,
  ) => void;
  clearNewArrivals: () => void;
}

export const useNewArrivalsStore = create<NewArrivalsState>()((set, get) => ({
  newArrivalsIdList: [],
  liverEventMap: new Map(),

  // setを比較して足されたものを算出
  updateNewArrivals: (newLiverEventList, prevLiverEventList, liverEventMap) => {
    // 初回の場合は差分抽出せずスキップ
    if (!prevLiverEventList) {
      set({ liverEventMap });
      return;
    }

    const newLiverEventIdSet = new Set(newLiverEventList.map((event) => event.id));
    const prevLiverEventIdSet = new Set(prevLiverEventList.map((event) => event.id));

    const idDiffSet = newLiverEventIdSet.difference(prevLiverEventIdSet);

    const now = Date.now();
    const newItems: NewArrivalId[] = Array.from(idDiffSet).map((id) => {
      return {
        id,
        addedTime: now,
      };
    });

    const mergedList = [...get().newArrivalsIdList, ...newItems].filter((item) => {
      // 追加後から一定時間経ったものは新着に含めない
      if (now - item.addedTime > newArrivalsKeepTime) return false;
      // 開始時間から一定時間経過したものも新着に含めない
      const liverEvent = liverEventMap.get(item.id);
      if (!liverEvent) return false;
      if (now - liverEvent.startAt.getTime() > newArrivalsKeepTime) return false;

      return true;
    });

    set({ liverEventMap, newArrivalsIdList: mergedList });
  },

  clearNewArrivals: () => {
    set({ newArrivalsIdList: [] });
  },
}));

export const selectNewArrivalsIdSet = createMemoSelector(
  (state: NewArrivalsState) => state.newArrivalsIdList,
  (newArrivalsIdList) => new Set(newArrivalsIdList.map((item) => item.id)),
);

/** 新着イベントを現在のタレントフィルターで絞り込んだ一覧 */
export function useNewArrivalsList(): NewArrival[] {
  const newArrivalsIdList = useNewArrivalsStore((state) => state.newArrivalsIdList);
  const liverEventMap = useNewArrivalsStore((state) => state.liverEventMap);
  const filterMap = useTalentFilterStore(selectTalentFilterMap);
  const filterEnabled = useTalentFilterStore((state) => state.talentFilterEnabled);

  return useMemo(() => {
    const list = newArrivalsIdList.flatMap((item) => {
      const liverEvent = liverEventMap.get(item.id);
      if (!liverEvent) return [];
      return {
        addedTime: item.addedTime,
        liverEvent,
      };
    });
    if (!filterEnabled || filterMap.size === 0) return list;
    return list.filter((item) =>
      talentFilter({
        liverEvent: item.liverEvent,
        filterMap,
      }),
    );
  }, [newArrivalsIdList, liverEventMap, filterMap, filterEnabled]);
}
