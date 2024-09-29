import { acceptHMRUpdate, defineStore } from "pinia";
import { computed, ref } from "vue";
import { useFocusStore } from "./focusStore";
import { useStorageStore } from "./storageStore";
import { createDateSectionList } from "@/lib/section";
import {
  fetchLiverEventList,
  getFilteredEventList,
  talentFilter,
  type LiverEvent,
} from "@/services/api";
import { type NijiLiverMap } from "@/services/nijisanji";

interface AddedEvent {
  id: string;
  addedTime: number;
}

export const useEventListStore = defineStore("eventListStore", () => {
  const storageStore = useStorageStore();
  const focusStore = useFocusStore();

  const liverEventList = ref<LiverEvent[] | null>(null);
  const liverEventIdSet = ref<Set<string>>(new Set());
  const addedEventList = ref<AddedEvent[]>([]);

  const addedEventIdSet = computed(() => {
    return new Set(addedEventList.value.map((addedEvent) => addedEvent.id));
  });

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

  const keywordList = computed(() => {
    const map: Record<string, number> = {};
    filteredEventList.value.forEach((event) => {
      event.keywordList.forEach((keyword) => {
        if (keyword in map) {
          map[keyword]++;
        } else {
          map[keyword] = 1;
        }
      });
    });
    const sortedKeywordList = Object.entries(map)
      .flatMap(([keyword, count]) => {
        if (count < 2) return [];
        return { value: keyword, count };
      })
      .sort((a, b) => b.count - a.count);
    return sortedKeywordList;
  });

  const hashtagList = computed(() => {
    const map: Record<string, number> = {};
    filteredEventList.value.forEach((event) => {
      event.hashList.forEach((hashtag) => {
        if (hashtag in map) {
          map[hashtag]++;
        } else {
          map[hashtag] = 1;
        }
      });
    });
    const sortedHashtagList = Object.entries(map)
      .flatMap(([hashtag, count]) => {
        if (count < 2) return [];
        return { value: hashtag, count };
      })
      .sort((a, b) => b.count - a.count);
    return sortedHashtagList;
  });

  const filteredAddedEventList = computed(() => {
    if (!addedEventList.value) return [];

    const filterMap = storageStore.talentFilterMap;
    const filterEnabled = storageStore.talentFilterEnabled;

    const list = addedEventList.value.flatMap((addedEvent) => {
      const liverEvent = liverEventMap.value.get(addedEvent.id);
      if (!liverEvent) return [];
      return {
        addedTime: addedEvent.addedTime,
        liverEvent,
      };
    });
    return list.filter((item) =>
      talentFilter({
        liverEvent: item.liverEvent,
        filterMap,
        filterEnabled,
      }),
    );
  });

  const onLiveEventList = computed(() => {
    return filteredEventList.value.filter((event) => event.isLive);
  });

  const dateSectionList = computed(() => {
    return createDateSectionList(filteredEventList.value).filter((dateSection) => {
      return dateSection.timeSectionList.some((section) => section.events.length > 0);
    });
  });

  // idをキーにしたLiverEventのMap
  const liverEventMap = computed(() => {
    const map = new Map<string, LiverEvent>();
    if (!liverEventList.value) return map;
    liverEventList.value.forEach((liverEvent) => {
      map.set(liverEvent.id, liverEvent);
    });
    return map;
  });

  async function updateLiverEventList(nijiLiverMap: NijiLiverMap) {
    const currLiverEventList = await fetchLiverEventList({ nijiLiverMap });
    const currLiverEventIdSet = new Set(currLiverEventList.map((event) => event.id));

    // setを比較して足されたものを算出
    // 初回の場合は差分抽出せずスキップ
    if (liverEventList.value) {
      const now = Date.now();

      // 新着としてキープする時間(ms)
      const addedEventKeepTime = 1000 * 60 * 60 * 2;

      // todo: vue-tscでエラーが出るので一旦無視
      // TS2339: Property 'difference' does not exist on type 'Set<string>'.
      // @ts-ignore
      const diff = currLiverEventIdSet.difference(liverEventIdSet.value);
      // @ts-ignore
      const currAddedEventList: AddedEvent[] = Array.from(diff).map((id) => {
        return {
          id,
          addedTime: now,
        };
      });

      const mergedEventList = [
        ...addedEventList.value.filter((addedEvent) => {
          // 追加後から一定時間経ったものは新着から削除
          return now - addedEvent.addedTime < addedEventKeepTime;
        }),
        ...currAddedEventList,
      ];

      addedEventList.value = mergedEventList;
    }

    liverEventList.value = currLiverEventList;
    liverEventIdSet.value = currLiverEventIdSet;

    // liverEventListに存在しないbookmarkを削除
    storageStore.bookmarkEventSet.forEach((id) => {
      if (!liverEventIdSet.value.has(id)) {
        storageStore.bookmarkEventSet.delete(id);
      }
    });
  }

  function clearAddedEventList() {
    addedEventList.value = [];
  }

  return {
    liverEventList,
    filteredEventList,
    onLiveEventList,
    dateSectionList,
    liverEventIdSet,
    liverEventMap,
    addedEventList,
    filteredAddedEventList,
    addedEventIdSet,
    updateLiverEventList,
    clearAddedEventList,
    keywordList,
    hashtagList,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useEventListStore, import.meta.hot));
}
