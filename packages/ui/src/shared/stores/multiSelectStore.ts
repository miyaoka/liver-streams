import { acceptHMRUpdate, defineStore } from "pinia";
import { ref } from "vue";

export const useMultiSelectStore = defineStore("multiSelectStore", () => {
  const isMultiSelectMode = ref(false);
  const multiSelectEventIdSet = ref<Set<string>>(new Set());

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
    isMultiSelectMode,
    multiSelectEventIdSet,
    toggleMultiSelectMode,
    toggleMultiSelectEvent,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMultiSelectStore, import.meta.hot));
}
