import icons from "@/assets/icons.json";
export const talentIcons: Record<string, string> = icons;

const defaultIcon = "/defaultAccount.svg";
const iconBase = "https://raw.githubusercontent.com/miyaoka/liver-streams/main/public/icons";
export function getChannelIcon(name: string) {
  const path = talentIcons[name];

  return path ? `${iconBase}${path}` : `${iconBase}${defaultIcon}`;
}
