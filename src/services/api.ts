import { fetchHoloEventList } from "./hololive";
import { fetchNijiStreamList, type NijiLiverMap, type NijiStream } from "./nijisanji";
import { getHashTagList, getYouTubeVideoId } from "@/lib/youtube";
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
  hashSet: Set<string>;
  collaboTalentSet: Set<string>;
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

  const nijiEvents = await getNijiEvents({ nijiLiverMap, nijiStreams });
  const wholeEvents = [...holoEvents, ...nijiEvents].sort(compareLiverEvent);
  return wholeEvents;
}

export function getPathname(url: string): string {
  return new URL(url).pathname;
}

export async function createId({
  url,
  thumbnail,
  talentName,
}: {
  url: string;
  thumbnail: string;
  talentName: string;
}): Promise<string> {
  // youtubeの動画idがあればそれを使う
  const videoId = getYouTubeVideoId(url);
  if (videoId) return videoId;

  // それ以外はurl, thumbnail, talentNameを結合してハッシュ化
  const uniqueStr = `${url}_${thumbnail}_${talentName}`;
  const id = await digestMessage(uniqueStr);

  // 8文字のハッシュ
  return id.substring(0, 8);
}

async function digestMessage(message: string) {
  const msgUint8 = new TextEncoder().encode(message); // (utf-8 の) Uint8Array にエンコードする
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8); // メッセージをハッシュする
  const hashArray = Array.from(new Uint8Array(hashBuffer)); // バッファーをバイト列に変換する
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join(""); // バイト列を 16 進文字列に変換する
  return hashHex;
}

// テキストから括弧で括られた文字列を抽出する
export function extractParenthesizedText(text: string): string[] {
  const parentheses = "（）［］【】｛｝〔〕〈〉《》「」『』〘〙〚〛";
  const openingParentheses = parentheses.split("").filter((_, index) => index % 2 === 0);
  const closingParentheses = parentheses.split("").filter((_, index) => index % 2 !== 0);
  const parenthesesPattern = new RegExp(
    `[${openingParentheses.join("")}](.*?)[${closingParentheses.join("")}]`,
    "g",
  );
  const matches = text.match(parenthesesPattern);
  if (!matches) return [];
  return matches.map((match) => match.slice(1, -1));
}

export async function createLiverEvent({
  affilication,
  startAt,
  title,
  url,
  thumbnail,
  endAt,
  isLive,
  talent,
  collaboTalents,
}: {
  affilication: "hololive" | "nijisanji";
  startAt: string;
  title: string;
  url: string;
  thumbnail: string;
  endAt: string | null;
  isLive: boolean;
  talent: LiverTalent;
  collaboTalents: LiverTalent[];
}): Promise<LiverEvent> {
  const startAtDate = new Date(startAt);
  const endAtDate = endAt ? new Date(endAt) : null;
  const id = await createId({ url, thumbnail, talentName: talent.name });
  const hashList = getHashTagList(title);
  const hashSet = new Set(hashList.map((h) => h.toLowerCase()));
  const collaboTalentSet = new Set(collaboTalents.map((t) => t.name));

  return {
    id: id,
    affilication,
    startAt: startAtDate,
    title,
    url,
    thumbnail,
    endAt: endAtDate,
    isLive,
    talent,
    collaboTalents,
    hashList,
    hashSet,
    collaboTalentSet,
  };
}

// 配信情報のtalentIdからtalentMapを参照して変換
async function getNijiEvents({
  nijiLiverMap,
  nijiStreams,
}: {
  nijiLiverMap: NijiLiverMap;
  nijiStreams: NijiStream[];
}): Promise<LiverEvent[]> {
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

  const events = nijiStreams.map(async (stream) => {
    const { title, url, thumbnail, startAt, endAt, isLive, talentId, collaboTalentIds } = stream;
    const talent = getTalent(talentId);
    if (!talent) return null;
    const collaboTalents = collaboTalentIds.flatMap((id) => {
      const collaboTalent = getTalent(id);
      if (!collaboTalent) return [];
      return collaboTalent;
    });
    return createLiverEvent({
      affilication: "nijisanji",
      startAt,
      title,
      url,
      thumbnail,
      endAt,
      isLive,
      talent,
      collaboTalents,
    });
  });

  const result = (await Promise.all(events)).filter((event) => event !== null);
  return result;
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
