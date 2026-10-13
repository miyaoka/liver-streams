import { getDateTime, getHourTime } from "@liver-streams/core";
import { create } from "zustand";

const updateInterval = 5000;

interface DateState {
  currentDate: Date;
}

export const useDateStore = create<DateState>()(() => ({
  currentDate: new Date(),
}));

const intervalId = setInterval(() => {
  useDateStore.setState({ currentDate: new Date() });
}, updateInterval);

if (import.meta.hot) {
  import.meta.hot.dispose(() => clearInterval(intervalId));
}

export const selectCurrentTime = (state: DateState) => state.currentDate.getTime();
export const selectCurrentDateTime = (state: DateState) => getDateTime(state.currentDate);
export const selectCurrentHourTime = (state: DateState) => getHourTime(state.currentDate);
