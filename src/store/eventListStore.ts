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
  const eventIdSet = ref<Set<string>>(new Set());
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
    const eventList = await fetchLiverEventList({ nijiLiverMap });
    const currIdSet = new Set(eventList.map((event) => event.id));

    // setを比較して足されたものを算出
    // 初回の場合は差分抽出せずスキップ
    if (liverEventList.value) {
      const addedTime = Date.now();

      // todo: vue-tscでエラーが出るので一旦無視
      // TS2339: Property 'difference' does not exist on type 'Set<string>'.
      // @ts-ignore
      const diff = currIdSet.difference(eventIdSet.value);
      // @ts-ignore
      const addedItems: AddedEvent[] = Array.from(diff).map((id) => {
        return {
          id,
          addedTime,
        };
      });

      addedEventList.value.push(...addedItems);
    }

    liverEventList.value = eventList;
    eventIdSet.value = currIdSet;
  }

  function clearAddedEventList() {
    addedEventList.value = [];
  }

  return {
    liverEventList,
    filteredEventList,
    onLiveEventList,
    dateSectionList,
    eventIdSet,
    liverEventMap,
    addedEventList,
    filteredAddedEventList,
    addedEventIdSet,
    updateLiverEventList,
    clearAddedEventList,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useEventListStore, import.meta.hot));
}
