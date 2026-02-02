import { DEFAULT_AVATAR_URL } from "@liver-streams/core";
import icons from "../data/icons.json";

const iconMap: Record<string, string> = icons;

export function getIcon(name: string, iconBaseUrl: string): string {
  const path = iconMap[name];
  if (!path) return DEFAULT_AVATAR_URL;
  return `${iconBaseUrl}${path}`;
}
