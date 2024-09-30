import { useLocalStorage } from "@vueuse/core";
import { acceptHMRUpdate, defineStore } from "pinia";

export interface TreeNode {
  id: string;
  checked: boolean;
  children?: TreeNode[];
}

export interface Node {
  [key: string]: string[] | Node;
}

export const useStorageStore = defineStore("storageStore", () => {
  const talentFilterMap = useLocalStorage("talentFilter", new Map<string, boolean>());
  const talentFilterEnabled = useLocalStorage("talentFilterEnabled", true);
  const bookmarkEventSet = useLocalStorage("bookmarkEventSet", new Set<string>());

  function setTalentFilter(name: string, enabled: boolean) {
    if (enabled) {
      talentFilterMap.value.set(name, enabled);
    } else {
      talentFilterMap.value.delete(name);
    }
  }

  function resetTalentFilter() {
    talentFilterMap.value.clear();
  }

  function toggleBookmarkEvent(id: string) {
    if (bookmarkEventSet.value.has(id)) {
      bookmarkEventSet.value.delete(id);
    } else {
      bookmarkEventSet.value.add(id);
    }
  }
  function resetBookmarkEventSet() {
    bookmarkEventSet.value.clear();
  }

  return {
    talentFilterMap,
    setTalentFilter,
    resetTalentFilter,
    talentFilterEnabled,
    bookmarkEventSet,
    toggleBookmarkEvent,
    resetBookmarkEventSet,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useStorageStore, import.meta.hot));
}
