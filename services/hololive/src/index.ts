import type {
  ChannelNode,
  EventService,
  EventServiceConfig,
  LiverEvent,
} from "@liver-streams/core";
import channelsData from "../data/channels.json";
import { fetchHoloEventList } from "./api";
import { getIcon as getIconPath } from "./icons";

const GITHUB_ICON_URL =
  "https://raw.githubusercontent.com/miyaoka/liver-streams/main/services/hololive/assets/icons";

export function createHololiveService(config: EventServiceConfig): EventService {
  const iconBaseUrl = config.localIconBaseUrl ?? GITHUB_ICON_URL;

  return {
    affiliation: "hololive",
    async fetchEventList(): Promise<LiverEvent[]> {
      return fetchHoloEventList();
    },
    getIcon(name: string): string {
      return getIconPath(name, iconBaseUrl);
    },
    getLogo(): string {
      return getIconPath("hololive_logo", iconBaseUrl);
    },
  };
}

export { fetchHoloEventList } from "./api";
export type { HoloSchedule, HoloDateGroup, HoloVideoDetail, HoloTalent } from "./api";

export const hololiveChannels: ChannelNode = channelsData;
