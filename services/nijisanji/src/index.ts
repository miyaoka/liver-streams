import { createLiverEvent } from "@liver-streams/core";
import type {
  ChannelNode,
  EventService,
  EventServiceConfig,
  LiverEvent,
  LiverTalent,
} from "@liver-streams/core";
import channelsData from "../data/channels.json";
import { fetchNijiLiverMap, fetchNijiStreamList } from "./api";
import type { NijiLiverMap, NijiStream } from "./api";
import { getIcon as getIconPath } from "./icons";

const GITHUB_ICON_URL =
  "https://raw.githubusercontent.com/miyaoka/liver-streams/main/services/nijisanji/assets/icons";

export interface NijisanjiServiceConfig extends EventServiceConfig {
  apiBaseUrl?: string;
}

export function createNijisanjiService(config: NijisanjiServiceConfig): EventService {
  const iconBaseUrl = config.localIconBaseUrl ?? GITHUB_ICON_URL;

  return {
    affiliation: "nijisanji",
    async fetchEventList(): Promise<LiverEvent[]> {
      const [nijiLiverMap, nijiStreams] = await Promise.all([
        fetchNijiLiverMap(),
        fetchNijiStreamList({ apiBaseUrl: config.apiBaseUrl }),
      ]);
      return getNijiEvents({
        nijiLiverMap,
        nijiStreams,
        iconBaseUrl,
      });
    },
    getIcon(name: string): string {
      return getIconPath(name, iconBaseUrl);
    },
    getLogo(): string {
      return getIconPath("nijisanji_logo", iconBaseUrl);
    },
  };
}

interface GetNijiEventsParams {
  nijiLiverMap: NijiLiverMap;
  nijiStreams: NijiStream[];
  iconBaseUrl: string;
}

async function getNijiEvents({
  nijiLiverMap,
  nijiStreams,
  iconBaseUrl,
}: GetNijiEventsParams): Promise<LiverEvent[]> {
  function getTalent(id: string): LiverTalent {
    const talent = nijiLiverMap[id];
    if (!talent) {
      console.warn(`talent not found: ${id}`);
      return {
        name: `Unknown (${id})`,
        image: getIconPath("", iconBaseUrl),
      };
    }
    return {
      name: talent.name,
      image: getIconPath(talent.name, iconBaseUrl),
    };
  }

  const events = nijiStreams.map(async (stream) => {
    const { title, url, thumbnail, startAt, endAt, isLive, talentId, collaboTalentIds } = stream;
    const talent = getTalent(talentId);
    const collaboTalents = collaboTalentIds.map((id) => getTalent(id));
    return createLiverEvent({
      affiliation: "nijisanji",
      startAt,
      title,
      url,
      thumbnail,
      endAt,
      isLive,
      talent,
      collaboTalents,
    });
  });

  const result = (await Promise.all(events)).filter((event) => event !== null);
  return result;
}

export { fetchNijiLiverMap, fetchNijiStreamList } from "./api";
export type { NijiLiver, NijiStream, NijiLiverMap } from "./api";

export const nijisanjiChannels: ChannelNode = channelsData;
