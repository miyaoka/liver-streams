import type { NijiStream } from "./api";

/** にじさんじ API（`https://www.nijisanji.jp/api/streams`）の配信 */
export interface NijisanjiApiStream {
  title: string;
  url: string;
  // youtube: maxresdefault が未生成の動画では null
  // twitch: 常に null
  "thumbnail-url": string | null;
  // youtube: sddefault を提供（削除・限定公開で null になる可能性あり）
  // twitch: 常に null
  "fallback-thumbnail-url": string | null;
  "start-at": string; // '2024-09-01T23:45:00.000+09:00'
  "end-at": string | null;
  status: "not_on_air" | "on_air";
  id: string;
  platform: "youtube" | "twitch";
  channel: NijisanjiApiChannel;
  "event-livers": NijisanjiApiLiver[];
}

interface NijisanjiApiChannel {
  name: string;
  "thumbnail-url": string;
  main: boolean;
  id: string;
  liver: NijisanjiApiLiver;
}

interface NijisanjiApiLiver {
  "external-id": string;
  id: string;
}

export function toNijiStreams(streams: NijisanjiApiStream[]): NijiStream[] {
  return (
    streams
      // twitch はサムネイルが提供されないため、YouTube 配信だけを返す
      .filter((stream) => stream.platform === "youtube")
      .map((stream) => ({
        title: stream.title,
        url: stream.url,
        thumbnail: stream["thumbnail-url"] ?? stream["fallback-thumbnail-url"],
        startAt: stream["start-at"],
        endAt: stream["end-at"],
        isLive: stream.status === "on_air",
        talentId: stream.channel.liver["external-id"],
        collaboTalentIds: stream["event-livers"].map((liver) => liver["external-id"]),
      }))
  );
}
