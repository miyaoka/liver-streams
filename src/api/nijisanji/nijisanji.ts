import livers from "./sample2/livers.json";
import livers_en from "./sample2/livers_en.json";
import type { StreamEvent, StreamTalent } from "..";

export interface Stream {
  data: Data[];
  included: Included[];
}
export interface Data {
  id: string;
  type: "youtube_event";
  attributes: Attributes;
  relationships: {
    youtube_channel: {
      data: {
        id: string;
        type: "youtube_channel";
      };
    };
    youtube_events_livers: {
      data: {
        id: string;
        type: "liver";
      }[];
    };
  };
}

export interface Attributes {
  title: string;
  description: string;
  url: string;
  thumbnail_url: string;
  start_at: string; // '2024-09-01T23:45:00.000+09:00'
  end_at: string | null;
  status: "not_on_air" | "on_air";
}

type Included = IncludedLiver | IncludedYoutubeChannel;

interface IncludedLiver {
  id: string;
  type: "liver";
  attributes: {
    external_id: string;
  };
  relationships: {
    youtube_channels: {};
  };
}

interface IncludedYoutubeChannel {
  id: string;
  type: "youtube_channel";
  attributes: {
    name: string;
    thumbnail_url: string;
    main: boolean;
  };
  relationships: {
    liver: {
      data: {
        id: string;
        type: "liver";
      };
    };
    youtube_events: {};
  };
}

interface Liver {
  slug: string;
  hidden: boolean;
  name: string;
  enName: string;
  images: LiverImages;
  socialLinks: LiverSocialLinks;
  siteColor: LiverSiteColor;
  id: string;
  subscriberCount: number;
}

interface LiverImages {
  fieldId: string;
  fullbody: LiverImage;
  halfbodyNew: LiverImage;
  head: LiverImage;
  variation: {
    fieldId: string;
    fullbody: LiverImage;
  }[];
  threeDVariation: null;
}

interface LiverImage {
  url: string;
  width: number;
  height: number;
}

interface LiverSocialLinks {
  fieldId: string;
  twitter: string;
  youtube: string;
  fanclub?: string;
  officialShop?: string;
}
interface LiverSiteColor {
  id: string;
  createdAt: string; // "2022-07-05T08:59:46.939Z"
  updatedAt: string;
  publishedAt: string;
  revisedAt: string;
  name: string;
  color1: string; // "#f8f8f8"
  color2: string;
}

const apiBase = "https://www.nijisanji.jp/api";

export async function getTalentMap(isDev: boolean): Promise<Map<string, StreamTalent>> {
  const liverMap = new Map<string, StreamTalent>();

  const jp = new URL(`${apiBase}/livers`);
  const params = new URLSearchParams({
    limit: "300",
    orderKey: "name",
    order: "asc",
    affiliation: "nijisanji",
    locale: "ja",
    includeAll: "true",
  });
  jp.search = params.toString();

  const en = new URL(`${apiBase}/livers`);
  const params2 = new URLSearchParams({
    limit: "300",
    orderKey: "name",
    order: "asc",
    affiliation: "nijisanjien",
    locale: "en",
    includeAll: "true",
  });
  en.search = params2.toString();

  const wholeLivers = isDev
    ? [...livers, ...livers_en]
    : (await Promise.all([jp, en].map((url) => fetch(url.href).then((res) => res.json())))).flat();

  wholeLivers.forEach((liver) => {
    liverMap.set(liver.id, {
      name: liver.name,
      image: liver.images.head.url,
    });
  });
  return liverMap;
}

function getTalent(
  liverId: string | undefined,
  extLiverIdMap: Map<string, string>,
  talentMap: Map<string, StreamTalent>,
): StreamTalent | undefined {
  if (!liverId) {
    console.error("liverId not found", liverId);
    return undefined;
  }
  const extLiverId = extLiverIdMap.get(liverId);
  if (!extLiverId) {
    console.error("extLiverId not found", liverId);
    return undefined;
  }
  const talent = talentMap.get(extLiverId);
  if (!talent) {
    console.error("talent not found", extLiverId);
    return undefined;
  }
  return talent;
}

function _getEvents(stream: Stream, talentMap: Map<string, StreamTalent>): StreamEvent[] {
  // streamのincludedからliverのidとexternal_idのマップを作成
  const channelMap = new Map<string, string>();
  const extLiverIdMap = new Map<string, string>();
  stream.included.forEach((included) => {
    if (included.type === "liver") {
      extLiverIdMap.set(included.id, included.attributes.external_id);
      return;
    }
    if (included.type === "youtube_channel") {
      channelMap.set(included.id, included.relationships.liver.data.id);
    }
  });

  // streamのdataからevent情報を取得し、talent情報を付与
  const events: StreamEvent[] = stream.data.flatMap((streamData) => {
    const {
      url,
      title,
      thumbnail_url: thumbnail,
      start_at: startAt,
      end_at: endAt,
    } = streamData.attributes;

    const channelLiverId = channelMap.get(streamData.relationships.youtube_channel.data.id);

    const talent = getTalent(channelLiverId, extLiverIdMap, talentMap);
    if (!talent) return [];

    const collaboTalents = streamData.relationships.youtube_events_livers.data.flatMap((liver) => {
      const talent = getTalent(liver.id, extLiverIdMap, talentMap);
      return talent ?? [];
    });

    return {
      url,
      title,
      thumbnail,
      startDate: new Date(startAt),
      endDate: endAt ? new Date(endAt) : null,
      isLive: streamData.attributes.status === "on_air",
      talent,
      collaboTalents,
    };
  });

  return events;
}

function getStreamApiUrl(offset: number): string {
  const url = new URL(`${apiBase}/streams`);
  const params = new URLSearchParams({
    day_offset: offset.toString(),
  });
  url.search = params.toString();
  return url.href;
}

async function getStreamData(isDev: boolean): Promise<Stream[]> {
  if (isDev) {
    const data = (
      await Promise.all([
        import("./sample2/streams1.json"),
        import("./sample2/streams0.json"),
        import("./sample2/streams-1.json"),
      ])
    ).map((res) => res.default as Stream);
    return data;
  }

  const urls = [1, 0, -1].map((offset) => getStreamApiUrl(offset));
  const data = await Promise.all(urls.map((url) => fetch(url).then((res) => res.json())));
  return data;
}

export async function getEvents({
  isDev,
  talentMap,
}: {
  isDev: boolean;
  talentMap: Map<string, StreamTalent>;
}): Promise<StreamEvent[]> {
  const streamDataList = await getStreamData(isDev);

  const eventList = streamDataList.map((stream) => _getEvents(stream, talentMap)).flat();

  return eventList;
}
