import livers from "./sample2/livers.json";
import livers_en from "./sample2/livers_en.json";

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

interface LiverSimple {
  name: string;
  image: string;
}

export async function getTalentMap() {
  const liverMap = new Map<string, LiverSimple>();
  [...livers, ...livers_en].forEach((liver) => {
    liverMap.set(liver.id, {
      name: liver.name,
      image: liver.images.head.url,
    });
  });
  return liverMap;
}

interface Video {
  url: string;
  title: string;
  thumbnail: string;
  startAt: string;
  endAt: string | null;
  isLive: boolean;
  talentId: string;
  collaboTalentIds: string[];
}
export async function getSchedule(stream: Stream): Promise<Video[]> {
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

  const videos = stream.data.flatMap((video) => {
    const {
      url,
      title,
      thumbnail_url: thumbnail,
      start_at: startAt,
      end_at: endAt,
    } = video.attributes;
    const channelLiverId = channelMap.get(video.relationships.youtube_channel.data.id);
    if (!channelLiverId) {
      console.error("channel not found", video);
      return [];
    }
    const extLiverId = extLiverIdMap.get(channelLiverId);
    if (!extLiverId) {
      console.error("liverId not found", video);
      return [];
    }
    return {
      url,
      title,
      thumbnail,
      startAt,
      endAt,
      isLive: video.attributes.status === "on_air",
      talentId: extLiverId,
      collaboTalentIds: video.relationships.youtube_events_livers.data.flatMap((liver) => {
        const extLiverId = extLiverIdMap.get(liver.id);
        if (!extLiverId) {
          console.error("collabo liverId not found", video);
          return [];
        }
        return extLiverId;
      }),
    };
  });

  return videos;
}
