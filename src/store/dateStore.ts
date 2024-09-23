import { acceptHMRUpdate, defineStore } from "pinia";
import { computed, ref } from "vue";
import { getDateTime, getHourTime } from "@/utils/date";

export const useDateStore = defineStore("dateStore", () => {
  const currentDate = ref(new Date());

  setInterval(() => {
    currentDate.value = new Date();
  }, 5000);

  const currentTime = computed(() => currentDate.value.getTime());
  const currentDateTime = computed(() => {
    return getDateTime(currentDate.value);
  });
  const currentHourTime = computed(() => {
    return getHourTime(currentDate.value);
  });

  return {
    currentDate,
    currentTime,
    currentDateTime,
    currentHourTime,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDateStore, import.meta.hot));
}
