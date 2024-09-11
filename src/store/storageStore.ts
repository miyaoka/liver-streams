import { useLocalStorage } from "@vueuse/core";
import { defineStore } from "pinia";
import { ref } from "vue";

export interface TreeNode {
  id: string;
  checked: boolean;
  children?: TreeNode[];
}

export interface Node {
  [key: string]: string[] | Node;
}

export const useStorageStore = defineStore("channelFilter", () => {
  const talentFilterMap = useLocalStorage("talentFilter", new Map<string, boolean>());
  const talentFilterEnabled = useLocalStorage("talentFilterEnabled", true);
  const searchTerm = useLocalStorage("filterSearchTerm", "");
  const isLiveOnly = ref(false);

  let scrollY = 0;
  function setSearchTerm(term: string) {
    // 未入力状態であればスクロール位置を保存する
    if (searchTerm.value === "") {
      scrollY = window.scrollY;
    }
    searchTerm.value = term;

    // 入力がクリアされたらスクロール位置をリセットする
    if (term === "") {
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollY);
      });
    }
  }
  function toggleLiveOnly() {
    // falseであればスクロール位置を保存する
    if (!isLiveOnly.value) {
      scrollY = window.scrollY;
    } else {
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollY);
      });
    }
    isLiveOnly.value = !isLiveOnly.value;
  }

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

  return {
    talentFilterMap,
    setTalentFilter,
    resetTalentFilter,
    talentFilterEnabled,
    searchTerm,
    setSearchTerm,
    isLiveOnly,
    toggleLiveOnly,
  };
});
