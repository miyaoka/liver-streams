import { compareLiverEvent } from "@liver-streams/core";
import type { EventService, LiverEvent } from "@liver-streams/core";
import { createHololiveService } from "@liver-streams/services-hololive";
import { createNijisanjiService } from "@liver-streams/services-nijisanji";

const nijiApiBaseUrl = import.meta.env.VITE_NIJI_API_BASE;

export const services: EventService[] = [
  createHololiveService({
    localIconBaseUrl: import.meta.env.DEV ? "/icons/hololive" : undefined,
  }),
  createNijisanjiService({
    localIconBaseUrl: import.meta.env.DEV ? "/icons/nijisanji" : undefined,
    apiBaseUrl: nijiApiBaseUrl,
  }),
];

export async function fetchAllEvents(): Promise<LiverEvent[]> {
  const results = await Promise.all(services.map((s) => s.fetchEventList()));
  return results.flat().sort(compareLiverEvent);
}

const defaultIcon = "/icons/defaultAccount.svg";

export function getChannelIcon(name: string): string {
  for (const service of services) {
    const icon = service.getIcon(name);
    if (icon) return icon;
  }
  return defaultIcon;
}

// Re-export types
export type { LiverEvent } from "@liver-streams/core";
