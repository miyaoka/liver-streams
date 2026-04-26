import { useLocalStorage } from "@vueuse/core";
import { acceptHMRUpdate, defineStore } from "pinia";
import { computed } from "vue";

interface FilterPreset {
  id: string;
  name: string;
  talents: string[];
}

function generateId(): string {
  return crypto.randomUUID();
}

export const useTalentFilterStore = defineStore("talentFilterStore", () => {
  const _talentFilterMap = useLocalStorage("talentFilter", new Map<string, boolean>());
  const talentFilterEnabled = useLocalStorage("talentFilterEnabled", true);
  const presets = useLocalStorage<FilterPreset[]>("talentFilterPresets", []);
  const activePresetId = useLocalStorage<string | null>("talentFilterActivePresetId", null);

  const talentFilterMap = computed(() => {
    if (!talentFilterEnabled.value) return new Map<string, boolean>();
    return _talentFilterMap.value;
  });

  const activePreset = computed(() => {
    if (!activePresetId.value) return undefined;
    return presets.value.find((p) => p.id === activePresetId.value);
  });

  // 現在のフィルターがアクティブプリセットから変更されているか
  const isModified = computed(() => {
    const preset = activePreset.value;
    if (!preset) return _talentFilterMap.value.size > 0;
    const currentTalents = [..._talentFilterMap.value.keys()].sort();
    const presetTalents = [...preset.talents].sort();
    if (currentTalents.length !== presetTalents.length) return true;
    return currentTalents.some((t, i) => t !== presetTalents[i]);
  });

  function setTalentFilter(name: string, enabled: boolean) {
    if (enabled) {
      _talentFilterMap.value.set(name, enabled);
    } else {
      _talentFilterMap.value.delete(name);
    }
  }

  function resetTalentFilter() {
    _talentFilterMap.value.clear();
    activePresetId.value = null;
  }

  function _loadTalentsToMap(talents: string[]) {
    _talentFilterMap.value.clear();
    for (const name of talents) {
      _talentFilterMap.value.set(name, true);
    }
  }

  function savePreset(name: string): FilterPreset {
    const preset: FilterPreset = {
      id: generateId(),
      name,
      talents: [..._talentFilterMap.value.keys()],
    };
    presets.value = [...presets.value, preset];
    activePresetId.value = preset.id;
    return preset;
  }

  function updatePreset(id: string) {
    presets.value = presets.value.map((p) => {
      if (p.id !== id) return p;
      return { ...p, talents: [..._talentFilterMap.value.keys()] };
    });
  }

  function loadPreset(id: string) {
    const preset = presets.value.find((p) => p.id === id);
    if (!preset) return;
    _loadTalentsToMap(preset.talents);
    activePresetId.value = id;
  }

  function deletePreset(id: string) {
    presets.value = presets.value.filter((p) => p.id !== id);
    if (activePresetId.value === id) {
      activePresetId.value = null;
    }
  }

  function renamePreset({ id, name }: { id: string; name: string }) {
    presets.value = presets.value.map((p) => {
      if (p.id !== id) return p;
      return { ...p, name };
    });
  }

  return {
    talentFilterMap,
    setTalentFilter,
    resetTalentFilter,
    talentFilterEnabled,
    presets,
    activePresetId,
    activePreset,
    isModified,
    savePreset,
    updatePreset,
    loadPreset,
    deletePreset,
    renamePreset,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTalentFilterStore, import.meta.hot));
}
