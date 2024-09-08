interface NijiLiver {
  name: string;
  enName: string;
  image: string;
  subscriberCount: number;
  hidden: boolean;
}

interface NijiStream {
  title: string;
  url: string;
  thumnail: string;
  startAt: string;
  endAt: string | null;
  isLive: boolean;
  talentId: string;
  collaboTalentIds: string[];
}

const proxyApiBase = "https://nijiapi-proxy.vercel.app/api/livers";

export async function getNijiLiversMap(isDev: boolean): Promise<Record<string, NijiLiver>> {
  if (isDev) {
    return import("./sample3/livers.json").then((res) => res.default);
  }

  const url = new URL(`${proxyApiBase}/livers`);
  return fetch(url).then((res) => res.json());
}

export async function getNijiStreams(isDev: boolean): Promise<NijiStream[]> {
  if (isDev) {
    return await import("./sample3/streams.json").then((res) => res.default);
  }

  const url = new URL(`${proxyApiBase}/streams`);
  return await fetch(url).then((res) => res.json());
}
