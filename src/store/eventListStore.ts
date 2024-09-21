import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useStorageStore } from "./storageStore";
import { useTalentStore } from "./talentStore";
import type { LiverEvent } from "@/api";
import { fetchHoloEventList } from "@/api/hololive/schedule";
import { fetchNijiStreamList, type NijiLiverMap, type NijiStream } from "@/api/nijisanji/nijisanji";
import { getChannelIcon } from "@/utils/icons";

// ホロライブとにじさんじの配信情報を取得
export async function fetchLiverEventList({
  nijiLiverMap,
}: {
  nijiLiverMap: NijiLiverMap;
}): Promise<LiverEvent[]> {
  const [holoEvents, nijiStreams] = await Promise.all([
    fetchHoloEventList(),
    fetchNijiStreamList(),
  ]);

  const nijiEvents = getNijiEvents({ nijiLiverMap, nijiStreams });
  const wholeEvents = [...holoEvents, ...nijiEvents].sort((a, b) => {
    const diff = a.startAt.getTime() - b.startAt.getTime();
    if (diff !== 0) return diff;
    // 同時間の場合はまずaffilicationでソート
    if (a.affilication !== b.affilication) return a.affilication.localeCompare(b.affilication);

    // 同affilicationの場合はtalent名でソート
    return a.talent.name.localeCompare(b.talent.name);
  });
  return wholeEvents;
}

// 配信情報のtalentIdからtalentMapを参照して変換
function getNijiEvents({
  nijiLiverMap,
  nijiStreams,
}: {
  nijiLiverMap: NijiLiverMap;
  nijiStreams: NijiStream[];
}): LiverEvent[] {
  function getTalent(id: string) {
    const talent = nijiLiverMap[id];
    if (!talent) {
      console.warn(`talent not found: ${id}`);
      return null;
    }
    return {
      name: talent.name,
      image: getChannelIcon(talent.name),
    };
  }

  const events: LiverEvent[] = nijiStreams.flatMap((stream) => {
    const { title, url, thumbnail, startAt, endAt, isLive, talentId, collaboTalentIds } = stream;
    const talent = getTalent(talentId);
    if (!talent) return [];
    return {
      affilication: "nijisanji",
      startAt: new Date(startAt),
      title,
      url,
      thumbnail,
      endAt: endAt ? new Date(endAt) : null,
      isLive,
      talent,
      collaboTalents: collaboTalentIds.flatMap((id) => getTalent(id) ?? []),
    };
  });

  return events;
}

function getFilteredEventList({
  liverEventList,
  filterMap,
  filterEnabled,
  searchTerms,
  focusedTalent,
  isLiveOnly,
}: {
  liverEventList: LiverEvent[];
  filterMap: Map<string, boolean>;
  filterEnabled: boolean;
  searchTerms: string[];
  focusedTalent: string | null;
  isLiveOnly: boolean;
}): LiverEvent[] {
  // 単一セレクト時
  if (focusedTalent) {
    return liverEventList.filter((video) => {
      return (
        video.talent.name === focusedTalent ||
        video.collaboTalents.some((collaborator) => {
          return collaborator.name === focusedTalent;
        })
      );
    });
  }

  const hasTalentfilter = filterEnabled && filterMap.size > 0;
  // 検索語をスペースで分割してOR検索
  const searchRegExp = searchTerms.length > 0 ? new RegExp(searchTerms.join("|"), "i") : null;

  return (
    liverEventList
      // talentでフィルタリング
      .filter((video) => {
        // フィルタなし
        if (!hasTalentfilter) return true;

        // タレント名かコラボタレント名がフィルターに含まれる動画のみ表示
        return (
          filterMap.has(video.talent.name) ||
          video.collaboTalents.some((collaborator) => {
            return filterMap.has(collaborator.name);
          })
        );
      })
      .filter((video) => {
        // live中のみ表示
        if (!isLiveOnly) return true;
        return video.isLive;
      })
      .filter((video) => {
        // 検索語にマッチしたイベントのみ表示
        if (!searchRegExp) return true;
        return (
          searchRegExp.test(video.title) ||
          searchRegExp.test(video.talent.name) ||
          video.collaboTalents.some((collaborator) => {
            return searchRegExp.test(collaborator.name);
          })
        );
      })
  );
}

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

  return {
    liverEventList,
    filteredEventList,
    onLiveEventList,
    dateSectionList,
    updateLiverEventList,
  };
});
