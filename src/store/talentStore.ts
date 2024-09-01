import { defineStore } from 'pinia'
import { ref } from 'vue'
import icons from '@/assets/icons.json'

export const talentIcons: Record<string, string> = icons

export const useTalentStore = defineStore('talentStore', () => {
  const hoveredTalent = ref<string | null>(null)
  const singleSelectedTalent = ref<string | null>(null)

  return {
    hoveredTalent,
    singleSelectedTalent
  }
})
