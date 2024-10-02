import { acceptHMRUpdate, defineStore } from "pinia";
import { ref } from "vue";
import type { LiverEvent } from "@/services/api";

export const useFocusStore = defineStore("focusStore", () => {
  const hoveredTalent = ref<string | null>(null);
  const hoveredCollaboTalentSet = ref<Set<string>>(new Set());

  const hoveredHashSet = ref<Set<string>>(new Set());

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
  function setHoveredHashtagSet(hashSet: Set<string>) {
    hoveredHashSet.value = new Set([...hashSet].filter((hash) => !ignoreHashList.includes(hash)));
  }
  function clearHoveredHashtagSet() {
    hoveredHashSet.value = new Set();
  }

  function hoverEvent(liverEvent: LiverEvent) {
    setHoveredTalents(
      liverEvent.talent.name,
      liverEvent.collaboTalents.map((t) => t.name),
    );
    setHoveredHashtagSet(liverEvent.hashtagSet);
  }

  function unhoverEvent() {
    clearHoveredTalents();
    clearHoveredHashtagSet();
  }

  return {
    hoveredTalent,
    hoveredCollaboTalentSet,
    hoveredHashSet,
    setHoveredTalents,
    clearHoveredTalents,
    setHoveredHashtagSet,
    clearHoveredHashtagSet,
    hoverEvent,
    unhoverEvent,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useFocusStore, import.meta.hot));
}
