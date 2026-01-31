import icons from "../data/icons.json";

const iconMap: Record<string, string> = icons;

export function getIcon(name: string, iconBaseUrl: string): string | undefined {
  const path = iconMap[name];
  if (!path) return undefined;
  return `${iconBaseUrl}${path}`;
}
