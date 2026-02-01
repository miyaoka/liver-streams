import type { LiverEvent } from "./index";

export interface EventService {
  readonly affiliation: "hololive" | "nijisanji";
  fetchEventList(): Promise<LiverEvent[]>;
  getIcon(name: string): string | undefined;
}

export interface EventServiceConfig {
  localIconBaseUrl?: string;
}
