import { acceptHMRUpdate, defineStore } from "pinia";
import { ref } from "vue";
import { useScrollStore } from "./scrollStore";
import type { LiverEvent } from "@/services/api";

export const useFocusStore = defineStore("focusStore", () => {
  const scrollStore = useScrollStore();

  const hoveredTalent = ref<string | null>(null);
  const hoveredCollaboTalentSet = ref<Set<string>>(new Set());
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
  function setHoveredTalents(talent: string, collaboTalents: string[] = []) {
    hoveredTalent.value = talent;
    hoveredCollaboTalentSet.value = new Set(collaboTalents);
  }
  function clearHoveredTalents() {
    hoveredTalent.value = null;
    hoveredCollaboTalentSet.value = new Set();
  }

  // shortsなどはマッチさせないように除く
  const ignoreHashList = ["#shorts", "#hololive"];
  function setHoveredHashSet(hashSet: Set<string>) {
    hoveredHashSet.value = new Set([...hashSet].filter((hash) => !ignoreHashList.includes(hash)));
  }
  function clearHoveredHashSet() {
    hoveredHashSet.value = new Set();
  }

  function hoverEvent(liverEvent: LiverEvent) {
    setHoveredTalents(
      liverEvent.talent.name,
      liverEvent.collaboTalents.map((t) => t.name),
    );
    setHoveredHashSet(liverEvent.hashSet);
  }

  function unhoverEvent() {
    clearHoveredTalents();
    clearHoveredHashSet();
  }

  return {
    hoveredTalent,
    hoveredCollaboTalentSet,
    focusedTalent,
    hoveredHashSet,
    setFocusedTalent,
    setHoveredTalents,
    clearHoveredTalents,
    setHoveredHashSet,
    clearHoveredHashSet,
    hoverEvent,
    unhoverEvent,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useFocusStore, import.meta.hot));
}
