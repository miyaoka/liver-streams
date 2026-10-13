import { create } from "zustand";

interface MultiSelectState {
  isMultiSelectMode: boolean;
  multiSelectEventIdSet: Set<string>;
  toggleMultiSelectMode: () => void;
  toggleMultiSelectEvent: (id: string) => void;
  /** 複数選択モードにして、選択を ids だけにする */
  setMultiSelectEvents: (ids: string[]) => void;
}

export const useMultiSelectStore = create<MultiSelectState>()((set, get) => ({
  isMultiSelectMode: false,
  multiSelectEventIdSet: new Set(),

  toggleMultiSelectMode: () => {
    const isMultiSelectMode = !get().isMultiSelectMode;
    if (isMultiSelectMode) {
      set({ isMultiSelectMode });
      return;
    }
    set({ isMultiSelectMode, multiSelectEventIdSet: new Set() });
  },
  toggleMultiSelectEvent: (id) => {
    const multiSelectEventIdSet = new Set(get().multiSelectEventIdSet);
    if (multiSelectEventIdSet.has(id)) {
      multiSelectEventIdSet.delete(id);
    } else {
      multiSelectEventIdSet.add(id);
    }
    set({ multiSelectEventIdSet });
  },
  setMultiSelectEvents: (ids) => {
    set({ isMultiSelectMode: true, multiSelectEventIdSet: new Set(ids) });
  },
}));
