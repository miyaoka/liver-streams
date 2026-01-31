import { compareLiverEvent } from "@liver-streams/core";
import { createHololiveService } from "@liver-streams/service-hololive";
import { createNijisanjiService } from "@liver-streams/service-nijisanji";
import type { EventService, LiverEvent } from "@liver-streams/core";

const iconBaseUrl = import.meta.env.DEV
  ? "/icons"
  : "https://raw.githubusercontent.com/miyaoka/liver-streams/main/public/icons";

const nijiApiBaseUrl = import.meta.env.VITE_NIJI_API_BASE;

export const services: EventService[] = [
  createHololiveService({ iconBaseUrl }),
  createNijisanjiService({ iconBaseUrl, apiBaseUrl: nijiApiBaseUrl }),
];

export async function fetchAllEvents(): Promise<LiverEvent[]> {
  const results = await Promise.all(services.map((s) => s.fetchEventList()));
  return results.flat().sort(compareLiverEvent);
}

const defaultIcon = `${iconBaseUrl}/defaultAccount.svg`;

export function getChannelIcon(name: string): string {
  for (const service of services) {
    const icon = service.getIcon(name);
    if (icon) return icon;
  }
  return defaultIcon;
}

// Re-export types
export type { LiverEvent } from "@liver-streams/core";
