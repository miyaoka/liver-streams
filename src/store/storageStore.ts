import { useLocalStorage } from "@vueuse/core";
import { acceptHMRUpdate, defineStore } from "pinia";
import { computed, ref } from "vue";
import { useScrollStore } from "./scrollStore";

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
  const favoriteEventSet = useLocalStorage("favoriteEventSet", new Set<string>());

  const scrollStore = useScrollStore();

  const isLiveOnly = ref(false);

  const searchTerms = computed(() => {
    return searchTerm.value.split(/\s+/).filter((term) => term !== "");
  });

  function setSearchTerm(term: string) {
    // 未入力状態であればスクロール位置を保存する
    if (searchTerm.value === "") {
      scrollStore.savePosition();
    }
    searchTerm.value = term;

    // 入力がクリアされたらスクロール位置をリセットする
    if (term === "") {
      scrollStore.restorePosition();
    }
  }
  function toggleLiveOnly() {
    // falseであればスクロール位置を保存する
    if (!isLiveOnly.value) {
      scrollStore.savePosition();

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
      scrollStore.restorePosition();
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

  function toggleFavoriteEvent(id: string) {
    if (favoriteEventSet.value.has(id)) {
      favoriteEventSet.value.delete(id);
    } else {
      favoriteEventSet.value.add(id);
    }
  }
  function resetFavoriteEventSet() {
    favoriteEventSet.value.clear();
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
    favoriteEventSet,
    toggleFavoriteEvent,
    resetFavoriteEventSet,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useStorageStore, import.meta.hot));
}
