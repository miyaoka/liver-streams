import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTalentStore = defineStore('talentStore', () => {
  const hoveredTalent = ref<string | null>(null)
  const selectedTalent = ref<string | null>(null)

  return {
    hoveredTalent,
    selectedTalent
  }
})
