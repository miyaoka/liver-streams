import type { NijiStream } from "@liver-streams/nijisanji";

const NIJISANJI_API_BASE = "https://www.nijisanji.jp/api";
// 前日・当日・翌日の配信を取得する
const DAY_OFFSETS = [1, 0, -1];
// にじさんじ API 自体の max-age=60 に合わせる
const CACHE_CONTROL = "public, max-age=60";
// にじさんじ API は User-Agent の無いリクエストを 403 で拒否し、Workers の fetch は User-Agent を付けない
const USER_AGENT = "liver-streams (+https://liver-streams.miyaoka.workers.dev)";

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

async function fetchDay(dayOffset: number): Promise<NijisanjiApiStream[]> {
  const url = new URL(`${NIJISANJI_API_BASE}/streams`);
  url.searchParams.set("day_offset", String(dayOffset));
  const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!response.ok) {
    throw new Error(`nijisanji API responded ${response.status} for ${url.href}`);
  }
  return response.json();
}

export async function handleStreams(): Promise<Response> {
  const streamLists = await Promise.all(DAY_OFFSETS.map(fetchDay));
  return Response.json(toNijiStreams(streamLists.flat()), {
    headers: { "Cache-Control": CACHE_CONTROL },
  });
}
