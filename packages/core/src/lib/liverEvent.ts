import { extractParenthesizedText, getHashTagList } from "./text";
import { getYouTubeVideoId } from "./youtube";
import type { LiverEvent, LiverTalent } from "../types";

async function digestMessage(message: string) {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hashHex;
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
