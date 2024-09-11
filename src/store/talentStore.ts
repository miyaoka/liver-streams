import { defineStore } from "pinia";
import { nextTick, ref } from "vue";

export const useTalentStore = defineStore("talentStore", () => {
  const hoveredTalents = ref<string[]>([]);
  const focusedTalent = ref<string | null>(null);
  const scrollY = ref<number>(0);
  function setFocusedTalent(talent: string | null) {
    // 非選択状態であればスクロール位置を保存する
    if (!focusedTalent.value) {
      scrollY.value = window.scrollY;
    }
    // セット。既に選択されていたら解除
    focusedTalent.value = focusedTalent.value === talent ? null : talent;

    // 選択が解除されたらスクロール位置をリセットする
    if (!focusedTalent.value) {
      nextTick(() => {
        window.scrollTo(0, scrollY.value);
      });
    }
  }
  function setHoveredTalents(talents: string[]) {
    hoveredTalents.value = talents;
  }

  return {
    hoveredTalents,
    focusedTalent,
    setFocusedTalent,
    setHoveredTalents,
  };
});
