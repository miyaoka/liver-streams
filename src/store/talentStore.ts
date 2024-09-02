import { defineStore } from 'pinia'
import { nextTick, ref } from 'vue'

export const useTalentStore = defineStore('talentStore', () => {
  const hoveredTalent = ref<string | null>(null)
  const singleSelectedTalent = ref<string | null>(null)
  const scrollY = ref<number>(0)
  function setSingleSelectedTalent(talent: string | null) {
    // 非選択状態であればスクロール位置を保存する
    if (!singleSelectedTalent.value) {
      scrollY.value = window.scrollY
    }
    // セット。既に選択されていたら解除
    singleSelectedTalent.value = singleSelectedTalent.value === talent ? null : talent

    // 選択が解除されたらスクロール位置をリセットする
    if (!singleSelectedTalent.value) {
      nextTick(() => {
        console.log('scrollY', scrollY.value)
      })
    }
  }

  return {
    hoveredTalent,
    singleSelectedTalent,
    setSingleSelectedTalent
  }
})
