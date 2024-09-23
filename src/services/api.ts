import { fetchHoloEventList } from "./hololive";
import { fetchNijiStreamList, type NijiLiverMap, type NijiStream } from "./nijisanji";
import { getHashList } from "@/lib/youtube";
import { getChannelIcon } from "@/utils/icons";

export interface LiverEvent {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  startAt: Date;
  endAt: Date | null;
  isLive: boolean;
  talent: LiverTalent;
  collaboTalents: LiverTalent[];
  affilication: "hololive" | "nijisanji";
  hashList: string[];
}

export interface LiverTalent {
  name: string;
  image: string;
}

export function compareLiverEvent(a: LiverEvent, b: LiverEvent) {
  const diff = a.startAt.getTime() - b.startAt.getTime();
  if (diff !== 0) return diff;

  // 同時間の場合はまずaffilicationでソート
  if (a.affilication !== b.affilication) return a.affilication.localeCompare(b.affilication);

  // 同affilicationの場合はtalent名でソート
  return a.talent.name.localeCompare(b.talent.name);
}

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
  const wholeEvents = [...holoEvents, ...nijiEvents].sort(compareLiverEvent);
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
      id: `${url}-${startAt}`,
      affilication: "nijisanji",
      startAt: new Date(startAt),
      title,
      url,
      thumbnail,
      endAt: endAt ? new Date(endAt) : null,
      isLive,
      talent,
      collaboTalents: collaboTalentIds.flatMap((id) => getTalent(id) ?? []),
      hashList: getHashList(title),
    };
  });

  return events;
}

export function talentFilter({
  filterEnabled,
  filterMap,
  liverEvent,
}: {
  filterEnabled: boolean;
  filterMap: Map<string, boolean>;
  liverEvent: LiverEvent;
}) {
  // フィルタなし
  if (!filterEnabled || filterMap.size === 0) return true;

  // タレント名かコラボタレント名がフィルターに含まれる動画のみ表示
  return (
    filterMap.has(liverEvent.talent.name) ||
    liverEvent.collaboTalents.some((collaborator) => {
      return filterMap.has(collaborator.name);
    })
  );
}

export function getFilteredEventList({
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

  // 検索語をスペースで分割してOR検索
  const searchRegExp = searchTerms.length > 0 ? new RegExp(searchTerms.join("|"), "i") : null;

  return (
    liverEventList
      // talentでフィルタリング
      .filter((liverEvent) => talentFilter({ filterEnabled, filterMap, liverEvent }))
      .filter((liverEvent) => {
        // live中のみ表示
        if (!isLiveOnly) return true;
        return liverEvent.isLive;
      })
      .filter((liverEvent) => {
        // 検索語にマッチしたイベントのみ表示
        if (!searchRegExp) return true;
        return (
          searchRegExp.test(liverEvent.title) ||
          searchRegExp.test(liverEvent.talent.name) ||
          liverEvent.collaboTalents.some((collaborator) => {
            return searchRegExp.test(collaborator.name);
          })
        );
      })
  );
}
