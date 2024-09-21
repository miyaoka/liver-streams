import { acceptHMRUpdate, defineStore } from "pinia";
import { computed, ref } from "vue";

export const useDateStore = defineStore("dateStore", () => {
  const currentDate = ref(new Date());

  setInterval(() => {
    currentDate.value = new Date();
  }, 5000);

  const currentTime = computed(() => currentDate.value.getTime());
  const currentDateWithoutTime = computed(() => {
    const date = currentDate.value;
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  });

  return {
    currentDate,
    currentTime,
    currentDateWithoutTime,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDateStore, import.meta.hot));
}
