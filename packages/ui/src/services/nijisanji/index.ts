export interface NijiLiver {
  // slug: string;
  name: string;
  // enName: string;
  // image: string;
  // subscriberCount: number;
  // hidden: boolean;
}

export interface NijiStream {
  title: string;
  url: string;
  thumbnail: string;
  startAt: string;
  endAt: string | null;
  isLive: boolean;
  talentId: string;
  collaboTalentIds: string[];
}

export interface NijiLiverMap {
  [talentId: string]: NijiLiver;
}
const proxyApiBase = import.meta.env.VITE_NIJI_API_BASE || "https://nijiapi-proxy.vercel.app/api";

export async function fetchNijiLiverMap(): Promise<NijiLiverMap> {
  // APIが重いので常にローカルファイルから取得する
  return import("./livers.json").then((res) => res.default);
}

export async function fetchNijiStreamList(): Promise<NijiStream[]> {
  // test用
  if (import.meta.env.VITE_TEST_DATA) {
    return await import("./sample3/streams.json").then((res) => res.default);
  }

  const url = new URL(`${proxyApiBase}/streams`);
  return fetch(url)
    .then((res) => res.json())
    .catch(() => []);
}
