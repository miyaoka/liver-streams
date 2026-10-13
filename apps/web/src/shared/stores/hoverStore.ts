import type { LiverEvent } from "@liver-streams/core";
import { create } from "zustand";

// shortsなどはマッチさせないように除く
const ignoreHashList = ["#shorts", "#hololive"];

interface HoverState {
  hoveredTalent: string | null;
  hoveredCollaboTalentSet: Set<string>;
  hoveredHashSet: Set<string>;
  setHoveredTalents: (talent: string, collaboTalents?: string[]) => void;
  clearHoveredTalents: () => void;
  setHoveredHashtagSet: (hashSet: Set<string>) => void;
  clearHoveredHashtagSet: () => void;
  hoverEvent: (liverEvent: LiverEvent) => void;
  unhoverEvent: () => void;
}

export const useHoverStore = create<HoverState>()((set, get) => ({
  hoveredTalent: null,
  hoveredCollaboTalentSet: new Set(),
  hoveredHashSet: new Set(),

  setHoveredTalents: (talent, collaboTalents = []) => {
    set({ hoveredTalent: talent, hoveredCollaboTalentSet: new Set(collaboTalents) });
  },
  clearHoveredTalents: () => {
    set({ hoveredTalent: null, hoveredCollaboTalentSet: new Set() });
  },
  setHoveredHashtagSet: (hashSet) => {
    set({ hoveredHashSet: new Set([...hashSet].filter((hash) => !ignoreHashList.includes(hash))) });
  },
  clearHoveredHashtagSet: () => {
    set({ hoveredHashSet: new Set() });
  },
  hoverEvent: (liverEvent) => {
    const { setHoveredTalents, setHoveredHashtagSet } = get();
    setHoveredTalents(
      liverEvent.talent.name,
      liverEvent.collaboTalents.map((t) => t.name),
    );
    setHoveredHashtagSet(liverEvent.hashtagSet);
  },
  unhoverEvent: () => {
    const { clearHoveredTalents, clearHoveredHashtagSet } = get();
    clearHoveredTalents();
    clearHoveredHashtagSet();
  },
}));
