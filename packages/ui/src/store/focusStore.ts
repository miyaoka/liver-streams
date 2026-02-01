import type { LiverEvent } from "@liver-streams/core";
import { acceptHMRUpdate, defineStore } from "pinia";
import { ref } from "vue";

export const useFocusStore = defineStore("focusStore", () => {
  const hoveredTalent = ref<string | null>(null);
  const hoveredCollaboTalentSet = ref<Set<string>>(new Set());
  const hoveredHashSet = ref<Set<string>>(new Set());
  const isMultiSelectMode = ref(false);
  const multiSelectEventIdSet = ref<Set<string>>(new Set());

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

  function toggleMultiSelectMode() {
    isMultiSelectMode.value = !isMultiSelectMode.value;
    if (!isMultiSelectMode.value) {
      multiSelectEventIdSet.value.clear();
    }
  }
  function toggleMultiSelectEvent(id: string) {
    if (multiSelectEventIdSet.value.has(id)) {
      multiSelectEventIdSet.value.delete(id);
    } else {
      multiSelectEventIdSet.value.add(id);
    }
  }

  return {
    hoveredTalent,
    hoveredCollaboTalentSet,
    hoveredHashSet,
    isMultiSelectMode,
    multiSelectEventIdSet,
    setHoveredTalents,
    clearHoveredTalents,
    setHoveredHashtagSet,
    clearHoveredHashtagSet,
    hoverEvent,
    unhoverEvent,
    toggleMultiSelectMode,
    toggleMultiSelectEvent,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useFocusStore, import.meta.hot));
}
