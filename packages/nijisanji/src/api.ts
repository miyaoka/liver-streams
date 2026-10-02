export interface NijiLiver {
  name: string;
}

export interface NijiStream {
  title: string;
  url: string;
  // API が稀に null を返す
  thumbnail: string | null;
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
  apiBaseUrl: string;
}

export function fetchNijiLiverMap(): Promise<NijiLiverMap> {
  // APIが重いので常にローカルファイルから取得する
  return import("../data/livers.json").then((res) => res.default);
}

export function fetchNijiStreamList(options: FetchDataOptions): Promise<NijiStream[]> {
  if (options.useTestData) {
    return import("../data/dev/streams.json").then((res) => res.default);
  }

  return fetch(`${options.apiBaseUrl}/streams`)
    .then((res) => res.json())
    .catch(() => []);
}
