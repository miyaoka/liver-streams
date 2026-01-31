import { createLiverEvent } from "@liver-streams/core";
import type {
  EventService,
  EventServiceConfig,
  LiverEvent,
  LiverTalent,
} from "@liver-streams/core";
import { fetchNijiLiverMap, fetchNijiStreamList } from "./api";
import type { NijiLiverMap, NijiStream } from "./api";
import { getIcon as getIconPath } from "./icons";

export interface NijisanjiServiceConfig extends EventServiceConfig {
  apiBaseUrl?: string;
}

export function createNijisanjiService(config: NijisanjiServiceConfig): EventService {
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
        iconBaseUrl: config.iconBaseUrl,
      });
    },
    getIcon(name: string): string | undefined {
      return getIconPath(name, config.iconBaseUrl);
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
  const defaultIcon = `${iconBaseUrl}/defaultAccount.svg`;

  function getTalent(id: string): LiverTalent {
    const talent = nijiLiverMap[id];
    if (!talent) {
      console.warn(`talent not found: ${id}`);
      return {
        name: `Unknown (${id})`,
        image: defaultIcon,
      };
    }
    const icon = getIconPath(talent.name, iconBaseUrl);
    return {
      name: talent.name,
      image: icon ?? defaultIcon,
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
