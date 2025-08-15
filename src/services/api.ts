import { fetchHoloEventList } from "./hololive";
import { fetchNijiStreamList, type NijiLiverMap, type NijiStream } from "./nijisanji";
import { extractParenthesizedText, getHashTagList } from "@/lib/text";
import { getYouTubeVideoId } from "@/lib/youtube";
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
  affiliation: "hololive" | "nijisanji";
  hashtagList: string[];
  hashtagSet: Set<string>;
  collaboTalentSet: Set<string>;
  keywordList: string[];
}

export interface LiverTalent {
  name: string;
  image: string;
}

export function compareLiverEvent(a: LiverEvent, b: LiverEvent) {
  const diff = a.startAt.getTime() - b.startAt.getTime();
  if (diff !== 0) return diff;

  // 同時間の場合はまずaffiliationでソート
  if (a.affiliation !== b.affiliation) return a.affiliation.localeCompare(b.affiliation);

  // 同affiliationの場合はtalent名でソート
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

export async function createLiverEvent({
  affiliation,
  startAt,
  title,
  url,
  thumbnail,
  endAt,
  isLive,
  talent,
  collaboTalents,
}: {
  affiliation: "hololive" | "nijisanji";
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
  const hashtagList = getHashTagList(title);
  const hashtagSet = new Set(hashtagList.map((h) => h.toLowerCase()));
  const collaboTalentSet = new Set(collaboTalents.map((t) => t.name));
  const keywordList = extractParenthesizedText(title, talent.name);

  return {
    id: id,
    affiliation,
    startAt: startAtDate,
    title,
    url,
    thumbnail,
    endAt: endAtDate,
    isLive,
    talent,
    collaboTalents,
    hashtagList,
    hashtagSet,
    collaboTalentSet,
    keywordList,
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
      // フォールバック処理: タレント情報が見つからない場合でも最低限の情報で表示
      return {
        name: `Unknown (${id})`,
        image: getChannelIcon(""), // デフォルトアイコンを使用
      };
    }
    return {
      name: talent.name,
      image: getChannelIcon(talent.name),
    };
  }

  const events = nijiStreams.map(async (stream) => {
    const { title, url, thumbnail, startAt, endAt, isLive, talentId, collaboTalentIds } = stream;
    const talent = getTalent(talentId);
    const collaboTalents = collaboTalentIds.map((id) => getTalent(id));
    return createLiverEvent({
      affiliation: "nijisanji",
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
