import { create } from "zustand";

interface ScrollState {
  scrollY: number;
  savePosition: () => void;
  restorePosition: () => void;
}

export const useScrollStore = create<ScrollState>()((set, get) => ({
  scrollY: 0,

  savePosition: () => {
    set({ scrollY: window.scrollY });
  },
  restorePosition: () => {
    requestAnimationFrame(() => {
      window.scrollTo(0, get().scrollY);
    });
  },
}));
