import { acceptHMRUpdate, defineStore } from "pinia";
import { computed, ref } from "vue";
import { useScrollStore } from "./scrollStore";
import { parseSearchString, searchQueryToSearchString } from "@/lib/search";

export const useSearchStore = defineStore("searchStore", () => {
  const scrollStore = useScrollStore();

  const searchString = ref("");

  const searchQuery = computed(() => {
    return parseSearchString(searchString.value);
  });
  const hasQuery = computed(() => {
    const { wordList, options, hashtagList } = searchQuery.value;
    return wordList.length > 0 || Object.keys(options).length > 0 || hashtagList.length > 0;
  });
  const searchStatusList = computed(() => {
    return searchQuery.value.options.status ?? [];
  });
  const searchTalentList = computed(() => {
    return searchQuery.value.options.talent ?? [];
  });
  const isLiveOnly = computed(() => {
    return searchStatusList.value.includes("live");
  });

  function setSearchString(term: string) {
    // 未入力状態であればスクロール位置を保存する
    if (searchString.value === "") {
      scrollStore.savePosition();
    }
    searchString.value = term;

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

    const { options } = searchQuery.value;
    let newStatusList = [];
    if (isLiveOnly.value) {
      newStatusList = searchStatusList.value.filter((status) => status !== "live");
    } else {
      newStatusList = [...searchStatusList.value, "live"];
    }
    searchString.value = searchQueryToSearchString({
      ...searchQuery.value,
      options: { ...options, status: newStatusList },
    });
  }

  function setFocusedTalent(talent: string | null) {
    // 非選択状態であればスクロール位置を保存する
    if (searchTalentList.value.length === 0) {
      scrollStore.savePosition();
    }

    const { options } = searchQuery.value;

    // 解除
    if (talent === null) {
      searchString.value = searchQueryToSearchString({
        ...searchQuery.value,
        options: { ...options, talent: [] },
      });
    } else {
      // 既にあれば解除
      let newTalentList = [];
      if (searchTalentList.value.includes(talent)) {
        newTalentList = searchTalentList.value.filter((t) => t !== talent);
      } else {
        // セット
        newTalentList = [talent];
      }
      searchString.value = searchQueryToSearchString({
        ...searchQuery.value,
        options: { ...options, talent: newTalentList },
      });
    }

    // 選択が解除されたらスクロール位置をリセットする
    if (searchTalentList.value.length === 0) {
      scrollStore.restorePosition();
    }
  }

  return {
    searchString,
    setSearchString,
    setFocusedTalent,
    searchQuery,
    isLiveOnly,
    toggleLiveOnly,
    hasQuery,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useSearchStore, import.meta.hot));
}
