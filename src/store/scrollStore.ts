import { acceptHMRUpdate, defineStore } from "pinia";
import { ref } from "vue";

export const useScrollStore = defineStore("scrollStore", () => {
  const scrollY = ref(0);

  function savePosition() {
    scrollY.value = window.scrollY;
  }
  function restorePosition() {
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollY.value);
    });
  }

  return {
    scrollY,
    savePosition,
    restorePosition,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useScrollStore, import.meta.hot));
}
