import { parseSearchString, searchQueryToSearchString } from "@liver-streams/core";
import { create } from "zustand";
import { createMemoSelector } from "../lib";
import { useScrollStore } from "./";

interface SearchState {
  searchString: string;
  setSearchString: (term: string) => void;
  toggleLiveOnly: () => void;
  setFocusedTalent: (talent: string | null) => void;
}

export const selectSearchQuery = createMemoSelector(
  (state: SearchState) => state.searchString,
  parseSearchString,
);
export const selectHasQuery = (state: SearchState) => {
  const { wordList, options, hashtagList } = selectSearchQuery(state);
  return wordList.length > 0 || Object.keys(options).length > 0 || hashtagList.length > 0;
};
const selectSearchStatusList = (state: SearchState) =>
  selectSearchQuery(state).options.status ?? [];
const selectSearchTalentList = (state: SearchState) =>
  selectSearchQuery(state).options.talent ?? [];
export const selectIsLiveOnly = (state: SearchState) =>
  selectSearchStatusList(state).includes("live");

export const useSearchStore = create<SearchState>()((set, get) => ({
  searchString: "",

  setSearchString: (term) => {
    const { savePosition, restorePosition } = useScrollStore.getState();
    // 未入力状態であればスクロール位置を保存する
    if (get().searchString === "") {
      savePosition();
    }
    set({ searchString: term });

    // 入力がクリアされたらスクロール位置をリセットする
    if (term === "") {
      restorePosition();
    }
  },
  toggleLiveOnly: () => {
    const { savePosition, restorePosition } = useScrollStore.getState();
    const state = get();
    const isLiveOnly = selectIsLiveOnly(state);
    // falseであればスクロール位置を保存する
    if (!isLiveOnly) {
      savePosition();

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
      restorePosition();
    }

    const searchQuery = selectSearchQuery(state);
    const searchStatusList = selectSearchStatusList(state);
    const newStatusList = isLiveOnly
      ? searchStatusList.filter((status) => status !== "live")
      : [...searchStatusList, "live"];
    set({
      searchString: searchQueryToSearchString({
        ...searchQuery,
        options: { ...searchQuery.options, status: newStatusList },
      }),
    });
  },
  setFocusedTalent: (talent) => {
    const { savePosition, restorePosition } = useScrollStore.getState();
    const state = get();
    const searchTalentList = selectSearchTalentList(state);
    // 非選択状態であればスクロール位置を保存する
    if (searchTalentList.length === 0) {
      savePosition();
    }

    const searchQuery = selectSearchQuery(state);
    set({
      searchString: searchQueryToSearchString({
        ...searchQuery,
        options: { ...searchQuery.options, talent: nextTalentList(searchTalentList, talent) },
      }),
    });

    // 選択が解除されたらスクロール位置をリセットする
    if (selectSearchTalentList(get()).length === 0) {
      restorePosition();
    }
  },
}));

// null は解除、選択中のタレントなら解除、それ以外はそのタレントだけを選択する
function nextTalentList(currentList: string[], talent: string | null): string[] {
  if (talent === null) return [];
  if (currentList.includes(talent)) return currentList.filter((t) => t !== talent);
  return [talent];
}
