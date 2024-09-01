import icons from '@/assets/icons.json'
export const talentIcons: Record<string, string> = icons

const defaultIcon = ''

export function getChannelIcon(name: string) {
  return talentIcons[name] ?? defaultIcon
}
