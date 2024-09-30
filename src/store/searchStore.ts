import { acceptHMRUpdate, defineStore } from "pinia";
import { computed, ref } from "vue";
import { useScrollStore } from "./scrollStore";
import { parseInput, toTerms } from "@/lib/search";

export const useSearchStore = defineStore("searchStore", () => {
  const scrollStore = useScrollStore();

  const searchTerm = ref("");

  const parsedSearchInput = computed(() => {
    return parseInput(searchTerm.value);
  });
  const hasQuery = computed(() => {
    const { wordList, options, hashtagList } = parsedSearchInput.value;
    return wordList.length > 0 || Object.keys(options).length > 0 || hashtagList.length > 0;
  });
  const searchStatusList = computed(() => {
    return parsedSearchInput.value.options.status ?? [];
  });
  const searchTalentList = computed(() => {
    return parsedSearchInput.value.options.talent ?? [];
  });
  const isLiveOnly = computed(() => {
    return searchStatusList.value.includes("live");
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

    const { options } = parsedSearchInput.value;
    let newStatusList = [];
    if (isLiveOnly.value) {
      newStatusList = searchStatusList.value.filter((status) => status !== "live");
    } else {
      newStatusList = [...searchStatusList.value, "live"];
    }
    searchTerm.value = toTerms({
      ...parsedSearchInput.value,
      options: { ...options, status: newStatusList },
    });
  }

  function setFocusedTalent(talent: string | null) {
    // 非選択状態であればスクロール位置を保存する
    if (searchTalentList.value.length === 0) {
      scrollStore.savePosition();
    }

    const { options } = parsedSearchInput.value;

    // 解除
    if (talent === null) {
      searchTerm.value = toTerms({
        ...parsedSearchInput.value,
        options: { ...options, talent: [] },
      });
    } else {
      // 既にあれば解除
      let newTalentList = [];
      if (searchTalentList.value.includes(talent)) {
        newTalentList = searchTalentList.value.filter((t) => t !== talent);
      } else {
        // セット
        newTalentList = [...searchTalentList.value, talent];
      }
      searchTerm.value = toTerms({
        ...parsedSearchInput.value,
        options: { ...options, talent: newTalentList },
      });
    }

    // 選択が解除されたらスクロール位置をリセットする
    if (searchTalentList.value.length === 0) {
      scrollStore.restorePosition();
    }
  }

  return {
    searchTerm,
    setSearchTerm,
    setFocusedTalent,
    parsedSearchInput,
    isLiveOnly,
    toggleLiveOnly,
    hasQuery,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSearchStore, import.meta.hot));
}
