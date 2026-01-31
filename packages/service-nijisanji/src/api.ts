export interface NijiLiver {
  name: string;
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

export interface FetchDataOptions {
  useTestData?: boolean;
  apiBaseUrl?: string;
}

const defaultApiBase = "https://nijiapi-proxy.vercel.app/api";

export function fetchNijiLiverMap(): Promise<NijiLiverMap> {
  // APIが重いので常にローカルファイルから取得する
  return import("./livers.json").then((res) => res.default);
}

export function fetchNijiStreamList(options: FetchDataOptions = {}): Promise<NijiStream[]> {
  if (options.useTestData) {
    return import("./sample3/streams.json").then((res) => res.default);
  }

  const apiBase = options.apiBaseUrl || defaultApiBase;
  const url = new URL(`${apiBase}/streams`);
  return fetch(url)
    .then((res) => res.json())
    .catch(() => []);
}
