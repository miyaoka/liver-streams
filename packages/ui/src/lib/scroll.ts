import type { DateSection } from "@liver-streams/core";

export function scrollToCurrentTime(
  dateSectionList: DateSection[],
  option: ScrollIntoViewOptions = { behavior: "smooth" },
) {
  const now = Date.now();
  // dateSection内のtimeSectionをflat化
  const timeSectionList = dateSectionList.flatMap((section) => section.timeSectionList);
  // 現在時刻より後のtimeSectionを取得
  const afterNowIndex = timeSectionList.findIndex((timeSection) => timeSection.time > now);

  // 現在より後のsectionがあればその手前、またはそのsection
  // 現在より後が無ければイベントが有る最後のsection
  const targetTimeSection =
    afterNowIndex !== -1
      ? (timeSectionList[afterNowIndex - 1] ?? timeSectionList[afterNowIndex])
      : timeSectionList.filter((timeSection) => timeSection.events.length > 0).at(-1);

  if (!targetTimeSection) return;

  const target = document.querySelector(
    `[data-id="time-section"][data-time="${targetTimeSection.time}"]`,
  );
  if (!target) return;

  target.scrollIntoView(option);
}

export function scrollToSectionTop(time: number) {
  const targetSectionEl = document.querySelector(`[data-id="date-section"][data-time="${time}"]`);
  if (!targetSectionEl) return;
  targetSectionEl.scrollIntoView({ behavior: "smooth" });
}

export function scrollToLiverEventTop(id: string) {
  const targetEventEl = document.querySelector(`[data-event-id="${id}"]`);
  if (!targetEventEl) return;
  targetEventEl.scrollIntoView({ behavior: "smooth" });
}
