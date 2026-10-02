import type {
  ChannelNode,
  EventService,
  EventServiceConfig,
  LiverEvent,
} from "@liver-streams/core";
import channelsData from "../data/channels.json";
import { fetchHoloEventList } from "./api";
import { getIcon as getIconPath } from "./icons";

export function createHololiveService({ iconBaseUrl }: EventServiceConfig): EventService {
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
