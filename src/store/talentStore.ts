import { acceptHMRUpdate, defineStore } from "pinia";
import { ref } from "vue";
import { useScrollStore } from "./scrollStore";

export const useTalentStore = defineStore("talentStore", () => {
  const hoveredTalents = ref<string[]>([]);
  const focusedTalent = ref<string | null>(null);
  const scrollStore = useScrollStore();

  function setFocusedTalent(talent: string | null) {
    // 非選択状態であればスクロール位置を保存する
    if (!focusedTalent.value) {
      scrollStore.savePosition();
    }
    // セット。既に選択されていたら解除
    focusedTalent.value = focusedTalent.value === talent ? null : talent;

    // 選択が解除されたらスクロール位置をリセットする
    if (!focusedTalent.value) {
      scrollStore.restorePosition();
    }
  }
  function setHoveredTalents(talents: string | string[]) {
    hoveredTalents.value = Array.isArray(talents) ? talents : [talents];
  }
  function clearHoveredTalents() {
    hoveredTalents.value = [];
  }

  return {
    hoveredTalents,
    focusedTalent,
    setFocusedTalent,
    setHoveredTalents,
    clearHoveredTalents,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTalentStore, import.meta.hot));
}
