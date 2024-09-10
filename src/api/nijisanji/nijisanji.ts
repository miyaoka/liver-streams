export interface NijiLiver {
  slug: string;
  name: string;
  enName: string;
  image: string;
  subscriberCount: number;
  hidden: boolean;
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

const proxyApiBase = "https://nijiapi-proxy.vercel.app/api";

async function _getNijiLiverMap(isDev: boolean): Promise<NijiLiverMap> {
  if (isDev) {
    return import("./sample3/livers.json").then((res) => res.default);
  }

  const url = new URL(`${proxyApiBase}/livers`);
  return fetch(url).then((res) => res.json());
}

export async function getNijiLiverMap(isDev: boolean): Promise<NijiLiverMap> {
  const liverMap = await _getNijiLiverMap(isDev);

  // Reduce image size
  return Object.entries(liverMap).reduce(
    (acc, [id, liver]) => {
      const reducedImage = `${liver.image}&w=200&fm=webp`;
      acc[id] = {
        ...liver,
        image: reducedImage,
      };
      return acc;
    },
    {} as Record<string, NijiLiver>,
  );
}

export async function getNijiStreams(isDev: boolean): Promise<NijiStream[]> {
  if (isDev) {
    return await import("./sample3/streams.json").then((res) => res.default);
  }

  const url = new URL(`${proxyApiBase}/streams`);
  return fetch(url).then((res) => res.json());
}
