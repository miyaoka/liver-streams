import { useLocalStorage } from "@vueuse/core";
import { acceptHMRUpdate, defineStore } from "pinia";
import { computed } from "vue";

export interface TreeNode {
  id: string;
  checked: boolean;
  children?: TreeNode[];
}

export interface Node {
  [key: string]: string[] | Node;
}

export const useStorageStore = defineStore("storageStore", () => {
  const _talentFilterMap = useLocalStorage("talentFilter", new Map<string, boolean>());
  const talentFilterEnabled = useLocalStorage("talentFilterEnabled", true);

  const talentFilterMap = computed(() => {
    if (!talentFilterEnabled.value) return new Map<string, boolean>();
    return _talentFilterMap.value;
  });
  function setTalentFilter(name: string, enabled: boolean) {
    if (enabled) {
      _talentFilterMap.value.set(name, enabled);
    } else {
      _talentFilterMap.value.delete(name);
    }
  }

  function resetTalentFilter() {
    _talentFilterMap.value.clear();
  }

  return {
    talentFilterMap,
    setTalentFilter,
    resetTalentFilter,
    talentFilterEnabled,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useStorageStore, import.meta.hot));
}
