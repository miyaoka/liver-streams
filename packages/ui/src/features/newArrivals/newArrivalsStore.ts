import type { LiverEvent } from "@liver-streams/core";
import { talentFilter } from "@liver-streams/core";
import { acceptHMRUpdate, defineStore } from "pinia";
import { computed, ref } from "vue";
import { useTalentFilterStore } from "../channelFilter/talentFilterStore";

interface NewArrivalId {
  id: string;
  addedTime: number;
}

export interface NewArrival {
  addedTime: number;
  liverEvent: LiverEvent;
}

// 新着としてキープする時間(ms)
const newArrivalsKeepTime = 1000 * 60 * 60 * 2;

export const useNewArrivalsStore = defineStore("newArrivalsStore", () => {
  const talentFilterStore = useTalentFilterStore();
  const newArrivalsIdList = ref<NewArrivalId[]>([]);
  // liverEventMap への参照を保持
  const liverEventMapRef = ref<Map<string, LiverEvent>>(new Map());

  const newArrivalsIdSet = computed(() => {
    return new Set(newArrivalsIdList.value.map((item) => item.id));
  });

  // 新着イベントを現在のタレントフィルターでフィルタリング
  const newArrivalsList = computed<NewArrival[]>(() => {
    if (!newArrivalsIdList.value) return [];

    const filterMap = talentFilterStore.talentFilterMap;
    const filterEnabled = talentFilterStore.talentFilterEnabled;

    const list = newArrivalsIdList.value.flatMap((item) => {
      const liverEvent = liverEventMapRef.value.get(item.id);
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
  });

  // setを比較して足されたものを算出
  function updateNewArrivals(
    newLiverEventList: LiverEvent[],
    prevLiverEventList: LiverEvent[] | null,
    liverEventMap: Map<string, LiverEvent>,
  ) {
    // liverEventMap への参照を更新
    liverEventMapRef.value = liverEventMap;

    // 初回の場合は差分抽出せずスキップ
    if (!prevLiverEventList) return;

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

    const mergedList = [...newArrivalsIdList.value, ...newItems].filter((item) => {
      // 追加後から一定時間経ったものは新着に含めない
      if (now - item.addedTime > newArrivalsKeepTime) return false;
      // 開始時間から一定時間経過したものも新着に含めない
      const liverEvent = liverEventMap.get(item.id);
      if (!liverEvent) return false;
      if (now - liverEvent.startAt.getTime() > newArrivalsKeepTime) return false;

      return true;
    });

    newArrivalsIdList.value = mergedList;
  }

  function clearNewArrivals() {
    newArrivalsIdList.value = [];
  }

  return {
    newArrivalsIdList,
    newArrivalsIdSet,
    newArrivalsList,
    updateNewArrivals,
    clearNewArrivals,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useNewArrivalsStore, import.meta.hot));
}
