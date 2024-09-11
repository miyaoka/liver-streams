import { useLocalStorage } from "@vueuse/core";
import { defineStore } from "pinia";
import { nextTick, ref } from "vue";

export interface TreeNode {
  id: string;
  checked: boolean;
  children?: TreeNode[];
}

export interface Node {
  [key: string]: string[] | Node;
}

export const useChannelFilterStore = defineStore("channelFilter", () => {
  const map = useLocalStorage("talentFilter", new Map<string, boolean>());
  const enabled = useLocalStorage("talentFilterEnabled", true);
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
      nextTick(() => {
        window.scrollTo(0, scrollY);
      });
    }
  }

  function setName(name: string, value: boolean) {
    if (value) {
      map.value.set(name, value);
    } else {
      map.value.delete(name);
    }
  }

  function reset() {
    map.value.clear();
  }

  return {
    map,
    setName,
    reset,
    enabled,
    searchTerm,
    setSearchTerm,
    isLiveOnly,
  };
});
