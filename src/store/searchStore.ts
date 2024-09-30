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
  const isLiveOnly = computed(() => {
    const { options } = parsedSearchInput.value;
    return options.status === "live";
  });
  const focusedTalent = computed(() => {
    return parsedSearchInput.value.options.talent;
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

    if (isLiveOnly.value) {
      const { status, ...restOptions } = options;
      searchTerm.value = toTerms({
        ...parsedSearchInput.value,
        options: restOptions,
      });
    } else {
      searchTerm.value = toTerms({
        ...parsedSearchInput.value,
        options: { ...options, status: "live" },
      });
    }
  }

  function setFocusedTalent(talent: string | null) {
    // 非選択状態であればスクロール位置を保存する
    if (!focusedTalent.value) {
      scrollStore.savePosition();
    }

    const { options } = parsedSearchInput.value;
    if (talent) {
      searchTerm.value = toTerms({
        ...parsedSearchInput.value,
        options: { ...options, talent },
      });
    } else {
      const { talent, ...restOptions } = options;
      searchTerm.value = toTerms({
        ...parsedSearchInput.value,
        options: restOptions,
      });
    }

    // 選択が解除されたらスクロール位置をリセットする
    if (!focusedTalent.value) {
      scrollStore.restorePosition();
    }
  }

  return {
    searchTerm,
    setSearchTerm,
    focusedTalent,
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
