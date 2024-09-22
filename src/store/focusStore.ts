import { acceptHMRUpdate, defineStore } from "pinia";
import { ref } from "vue";
import { useScrollStore } from "./scrollStore";

export const useFocusStore = defineStore("focusStore", () => {
  const scrollStore = useScrollStore();

  const hoveredTalents = ref<string[]>([]);
  const focusedTalent = ref<string | null>(null);
  const hoveredHashSet = ref<Set<string>>(new Set());

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
  function setHoveredHashSet(hashSet: Set<string>) {
    hoveredHashSet.value = hashSet;
  }
  function clearHoveredHashSet() {
    hoveredHashSet.value = new Set();
  }

  return {
    hoveredTalents,
    focusedTalent,
    hoveredHashSet,
    setFocusedTalent,
    setHoveredTalents,
    clearHoveredTalents,
    setHoveredHashSet,
    clearHoveredHashSet,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useFocusStore, import.meta.hot));
}
