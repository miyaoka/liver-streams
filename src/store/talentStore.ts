import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTalentStore = defineStore('talentStore', () => {
  const hoveredTalent = ref<string | null>(null)
  const singleSelectedTalent = ref<string | null>(null)
  function setSingleSelectedTalent(talent: string | null) {
    if (singleSelectedTalent.value === talent) {
      singleSelectedTalent.value = null
      return
    }
    singleSelectedTalent.value = talent
  }

  return {
    hoveredTalent,
    singleSelectedTalent,
    setSingleSelectedTalent
  }
})
