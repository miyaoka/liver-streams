import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTalentStore = defineStore('talentStore', () => {
  const hoveredTalent = ref<string | null>(null)
  const singleSelectedTalent = ref<string | null>(null)

  return {
    hoveredTalent,
    singleSelectedTalent
  }
})
