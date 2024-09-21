import { useLocalStorage } from "@vueuse/core";
import { acceptHMRUpdate, defineStore } from "pinia";
import { computed, ref } from "vue";

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
  const searchTerm = useLocalStorage("filterSearchTerm", "");
  const isLiveOnly = ref(false);

  const searchTerms = computed(() => {
    return searchTerm.value.split(/\s+/).filter((term) => term !== "");
  });

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

      // ライブ中のイベントのtimeSectionの先頭にスクロールする
      requestAnimationFrame(() => {
        const onLiveEvent = document.querySelector(
          "[data-id=time-section]:has([data-id=liver-event-card])",
        );
        if (onLiveEvent) {
          onLiveEvent.scrollIntoView({ behavior: "instant" });
        }
      });
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
    searchTerms,
    setSearchTerm,
    isLiveOnly,
    toggleLiveOnly,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useStorageStore, import.meta.hot));
}
