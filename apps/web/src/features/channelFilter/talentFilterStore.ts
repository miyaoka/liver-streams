import { create } from "zustand";
import { bindLocalStorageItem, createLocalStorageItem } from "../../shared/lib";

interface FilterPreset {
  id: string;
  name: string;
  talents: string[];
}

interface TalentFilterState {
  /** フィルターの有効・無効に関わらず保存されている選択。表示には selectTalentFilterMap を使う */
  rawTalentFilterMap: Map<string, boolean>;
  talentFilterEnabled: boolean;
  presets: FilterPreset[];
  activePresetId: string | null;
  setTalentFilter: (name: string, enabled: boolean) => void;
  resetTalentFilter: () => void;
  savePreset: (name: string) => FilterPreset;
  updatePreset: (id: string) => void;
  loadPreset: (id: string) => void;
  deletePreset: (id: string) => void;
  renamePreset: (params: { id: string; name: string }) => void;
}

const talentFilterMapStorage = createLocalStorageItem("talentFilter", new Map<string, boolean>());
const talentFilterEnabledStorage = createLocalStorageItem("talentFilterEnabled", true);
const presetsStorage = createLocalStorageItem<FilterPreset[]>("talentFilterPresets", []);
const activePresetIdStorage = createLocalStorageItem<string | null>(
  "talentFilterActivePresetId",
  null,
);

function generateId(): string {
  return crypto.randomUUID();
}

export const useTalentFilterStore = create<TalentFilterState>()((set, get) => ({
  rawTalentFilterMap: talentFilterMapStorage.read(),
  talentFilterEnabled: talentFilterEnabledStorage.read(),
  presets: presetsStorage.read(),
  activePresetId: activePresetIdStorage.read(),

  setTalentFilter: (name, enabled) => {
    const rawTalentFilterMap = new Map(get().rawTalentFilterMap);
    if (enabled) {
      rawTalentFilterMap.set(name, enabled);
    } else {
      rawTalentFilterMap.delete(name);
    }
    set({ rawTalentFilterMap });
  },

  resetTalentFilter: () => {
    set({ rawTalentFilterMap: new Map(), activePresetId: null });
  },

  savePreset: (name) => {
    const preset: FilterPreset = {
      id: generateId(),
      name,
      talents: [...get().rawTalentFilterMap.keys()],
    };
    set({ presets: [...get().presets, preset], activePresetId: preset.id });
    return preset;
  },

  updatePreset: (id) => {
    const talents = [...get().rawTalentFilterMap.keys()];
    set({
      presets: get().presets.map((p) => {
        if (p.id !== id) return p;
        return { ...p, talents };
      }),
    });
  },

  loadPreset: (id) => {
    const preset = get().presets.find((p) => p.id === id);
    if (!preset) return;
    set({
      rawTalentFilterMap: new Map(preset.talents.map((name) => [name, true])),
      activePresetId: id,
    });
  },

  deletePreset: (id) => {
    const { presets, activePresetId } = get();
    set({
      presets: presets.filter((p) => p.id !== id),
      activePresetId: activePresetId === id ? null : activePresetId,
    });
  },

  renamePreset: ({ id, name }) => {
    set({
      presets: get().presets.map((p) => {
        if (p.id !== id) return p;
        return { ...p, name };
      }),
    });
  },
}));

bindLocalStorageItem(useTalentFilterStore, "rawTalentFilterMap", talentFilterMapStorage);
bindLocalStorageItem(useTalentFilterStore, "talentFilterEnabled", talentFilterEnabledStorage);
bindLocalStorageItem(useTalentFilterStore, "presets", presetsStorage);
bindLocalStorageItem(useTalentFilterStore, "activePresetId", activePresetIdStorage);

const disabledTalentFilterMap = new Map<string, boolean>();

/** フィルターが無効なら空の Map を返す。返した Map は書き換えない */
export const selectTalentFilterMap = (state: TalentFilterState) =>
  state.talentFilterEnabled ? state.rawTalentFilterMap : disabledTalentFilterMap;

export const selectActivePreset = (state: TalentFilterState) => {
  if (!state.activePresetId) return undefined;
  return state.presets.find((p) => p.id === state.activePresetId);
};

// 現在のフィルターがアクティブプリセットから変更されているか
export const selectIsModified = (state: TalentFilterState) => {
  const preset = selectActivePreset(state);
  if (!preset) return state.rawTalentFilterMap.size > 0;
  const currentTalents = [...state.rawTalentFilterMap.keys()].sort();
  const presetTalents = [...preset.talents].sort();
  if (currentTalents.length !== presetTalents.length) return true;
  return currentTalents.some((t, i) => t !== presetTalents[i]);
};
