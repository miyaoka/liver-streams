import { toNijiStreams } from "@liver-streams/nijisanji";
import type { NijisanjiApiStream } from "@liver-streams/nijisanji";

const NIJISANJI_API_BASE = "https://www.nijisanji.jp/api";
// ホロライブの取得範囲（前日〜翌日）に揃える。並び順はクライアントが開始時刻で決める
const DAY_OFFSETS = [1, 0, -1];
// にじさんじ API 自体の max-age=60 に合わせる
const CACHE_CONTROL = "public, max-age=60";
// にじさんじ API は User-Agent の無いリクエストを 403 で拒否し、Workers の fetch は User-Agent を付けない
const USER_AGENT = "liver-streams (+https://liver-streams.miyaoka.workers.dev)";

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
