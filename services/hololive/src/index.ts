import channelsData from "../data/channels.json";
import { fetchHoloEventList } from "./api";
import { getIcon as getIconPath } from "./icons";
import type {
  ChannelNode,
  EventService,
  EventServiceConfig,
  LiverEvent,
} from "@liver-streams/core";

export function createHololiveService(config: EventServiceConfig): EventService {
  return {
    affiliation: "hololive",
    async fetchEventList(): Promise<LiverEvent[]> {
      return fetchHoloEventList();
    },
    getIcon(name: string): string | undefined {
      return getIconPath(name, config.iconBaseUrl);
    },
  };
}

export { fetchHoloEventList } from "./api";
export type { HoloSchedule, HoloDateGroup, HoloVideoDetail, HoloTalent } from "./api";

export const hololiveChannels: ChannelNode = channelsData;
