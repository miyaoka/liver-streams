import { defineStore } from 'pinia'
import { nextTick, ref } from 'vue'

export const useTalentStore = defineStore('talentStore', () => {
  const hoveredTalent = ref<string | null>(null)
  const focusedTalent = ref<string | null>(null)
  const scrollY = ref<number>(0)
  function setFocusedTalent(talent: string | null) {
    // 非選択状態であればスクロール位置を保存する
    if (!focusedTalent.value) {
      scrollY.value = window.scrollY
    }
    // セット。既に選択されていたら解除
    focusedTalent.value = focusedTalent.value === talent ? null : talent

    // 選択が解除されたらスクロール位置をリセットする
    if (!focusedTalent.value) {
      nextTick(() => {
        console.log('scrollY', scrollY.value)
      })
    }
  }

  return {
    hoveredTalent,
    focusedTalent,
    setFocusedTalent
  }
})
