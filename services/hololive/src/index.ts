import { fetchHoloEventList } from "./api";
import { getIcon as getIconPath } from "./icons";
import type { EventService, EventServiceConfig, LiverEvent, ChannelNode  } from "@liver-streams/core";

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

import channelsData from "../data/channels.json";
export const hololiveChannels: ChannelNode = channelsData;
