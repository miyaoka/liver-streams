import { acceptHMRUpdate, defineStore } from "pinia";
import { computed, ref } from "vue";
import { useStorageStore } from "./storageStore";
import { useTalentStore } from "./talentStore";
import { fetchLiverEventList, getFilteredEventList, type LiverEvent } from "@/api";
import { type NijiLiverMap } from "@/api/nijisanji/nijisanji";

export interface DateSection {
  time: number;
  date: Date;
  timeSectionList: TimeSection[];
}

export interface TimeSection {
  time: number;
  events: LiverEvent[];
}

function createDateSectionList(liverEventList: LiverEvent[]): DateSection[] {
  if (liverEventList.length === 0) return [];
  const firstEvent = liverEventList[0];
  const lastEvent = liverEventList[liverEventList.length - 1];

  function getHourTime(date: Date): number {
    const hour = date.getHours();
    return new Date(date).setHours(hour, 0, 0, 0);
  }

  function getDateTime(date: Date): number {
    return new Date(date).setHours(0, 0, 0, 0);
  }

  const oneHour = 3600000;
  const oneDay = 86400000;
  const firstDateTime = getDateTime(firstEvent.startAt);
  const lastDateTime = getDateTime(lastEvent.startAt) + oneDay;

  // 時間ごとにイベントをグループ化
  const liverEventMap = new Map<number, LiverEvent[]>();
  liverEventList.forEach((event) => {
    const time = getHourTime(event.startAt);
    if (!liverEventMap.has(time)) {
      liverEventMap.set(time, []);
    }
    liverEventMap.get(time)?.push(event);
  });

  const dateSectionList: DateSection[] = [];

  // 最初の日から最後の日まで1時間ずつセクションを作成し、該当するイベントをセクションに追加
  for (let time = firstDateTime; time < lastDateTime; time += oneDay) {
    const timeSectionList: TimeSection[] = [];

    for (let i = 0; i < 24; i++) {
      const hourTime = time + i * oneHour;
      const events = liverEventMap.get(hourTime) || [];

      timeSectionList.push({
        time: hourTime,
        events,
      });
    }
    dateSectionList.push({
      time,
      date: new Date(time),
      timeSectionList,
    });
  }

  // イベントがある日のみに絞り込む
  return dateSectionList.filter((dateSection) => {
    return dateSection.timeSectionList.some((section) => section.events.length > 0);
  });
}

export const useEventListStore = defineStore("eventListStore", () => {
  const storageStore = useStorageStore();
  const talentStore = useTalentStore();
  const liverEventList = ref<LiverEvent[] | null>(null);

  const filteredEventList = computed(() => {
    if (!liverEventList.value) return [];
    return getFilteredEventList({
      liverEventList: liverEventList.value,
      filterMap: storageStore.talentFilterMap,
      filterEnabled: storageStore.talentFilterEnabled,
      searchTerms: storageStore.searchTerms,
      focusedTalent: talentStore.focusedTalent,
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

  function updateLiverEventList(nijiLiverMap: NijiLiverMap) {
    fetchLiverEventList({ nijiLiverMap }).then((events) => {
      liverEventList.value = events;
    });
  }

  function scrollToCurrentTime(option: ScrollIntoViewOptions = { behavior: "smooth" }) {
    const now = Date.now();
    // dateSection内のtimeSectionをflat化
    const timeSectionList = dateSectionList.value.flatMap((section) => section.timeSectionList);
    // 現在時刻より後のtimeSectionを取得
    const afterNowIndex = timeSectionList.findIndex((timeSection) => timeSection.time > now);

    // 現在より後のsectionがあればその手前、またはそのsection
    // 現在より後が無ければイベントが有る最後のsection
    const targetTimeSection =
      afterNowIndex > 0
        ? (timeSectionList[afterNowIndex - 1] ?? timeSectionList[afterNowIndex])
        : timeSectionList.filter((timeSection) => timeSection.events.length > 0).at(-1);

    if (!targetTimeSection) return;

    const target = document.querySelector(
      `[data-id="time-section"][data-time="${targetTimeSection.time}"]`,
    );
    if (!target) return;

    target.scrollIntoView(option);
  }

  return {
    liverEventList,
    filteredEventList,
    onLiveEventList,
    dateSectionList,
    updateLiverEventList,
    scrollToCurrentTime,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useEventListStore, import.meta.hot));
}
