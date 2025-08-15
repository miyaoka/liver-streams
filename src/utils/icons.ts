import icons from "@/assets/icons.json";
export const talentIcons: Record<string, string> = icons;

const defaultIcon = "/defaultAccount.svg";
// 環境に応じてアイコンのベースパスを切り替え
const iconBase = import.meta.env.DEV
  ? "/icons" // ローカル開発環境
  : "https://raw.githubusercontent.com/miyaoka/liver-streams/main/public/icons"; // 本番環境
export function getChannelIcon(name: string) {
  const path = talentIcons[name];

  return path ? `${iconBase}${path}` : `${iconBase}${defaultIcon}`;
}
