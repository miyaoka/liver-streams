import icons from "@/assets/icons.json";
export const talentIcons: Record<string, string> = icons;

const defaultIcon = "";

export function getChannelIcon(name: string) {
  const path = talentIcons[name];

  return path
    ? `https://raw.githubusercontent.com/miyaoka/liver-streams/main/public/icons${path}`
    : defaultIcon;
}
