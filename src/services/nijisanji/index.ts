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

async function _fetchNijiLiverMap(): Promise<NijiLiverMap> {
  // if (import.meta.env.VITE_TEST_DATA) {
  // 重いのでローカルファイルから取得する
  return import("./sample3/livers.json").then((res) => res.default);
  // }

  // const url = new URL(`${proxyApiBase}/livers`);
  // return fetch(url).then((res) => res.json());
}

export async function fetchNijiLiverMap(): Promise<NijiLiverMap> {
  const liverMap = await _fetchNijiLiverMap();
  return liverMap;

  // Reduce image size
  // return Object.entries(liverMap).reduce(
  //   (acc, [id, liver]) => {
  //     const reducedImage = `${liver.image}&w=200&fm=webp`;
  //     acc[id] = {
  //       ...liver,
  //       image: reducedImage,
  //     };
  //     return acc;
  //   },
  //   {} as Record<string, NijiLiver>,
  // );
}

export async function fetchNijiStreamList(): Promise<NijiStream[]> {
  if (import.meta.env.VITE_TEST_DATA) {
    return await import("./sample3/streams.json").then((res) => res.default);
  }

  const url = new URL(`${proxyApiBase}/streams`);
  return fetch(url)
    .then((res) => res.json())
    .catch(() => []);
}
