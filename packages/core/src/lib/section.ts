import type { LiverEvent } from "../types";
import { getDateTime, getHourTime } from "../utils/date";

export interface DateSection {
  time: number;
  date: Date;
  timeSectionList: TimeSection[];
}

export interface TimeSection {
  time: number;
  events: LiverEvent[];
}

export function createDateSectionList(liverEventList: LiverEvent[]): DateSection[] {
  const firstEvent = liverEventList[0];
  const lastEvent = liverEventList[liverEventList.length - 1];
  if (!firstEvent || !lastEvent) return [];

  const oneHour = 3600000;
  const oneDay = 86400000;
  const firstDateTime = getDateTime(firstEvent.startAt);
  const lastDateTime = getDateTime(lastEvent.startAt) + oneDay;

  // 時間ごとにイベントをグループ化
  const liverEventMap = new Map<number, LiverEvent[]>();
  liverEventList.forEach((event) => {
    const time = getHourTime(event.startAt);
    if (!liverEventMap.has(time)) {
      liverEventMap.set(time, []);
    }
    liverEventMap.get(time)?.push(event);
  });

  const dateSectionList: DateSection[] = [];

  // 最初の日から最後の日まで1時間ずつセクションを作成し、該当するイベントをセクションに追加
  for (let time = firstDateTime; time < lastDateTime; time += oneDay) {
    const timeSectionList: TimeSection[] = [];

    for (let i = 0; i < 24; i++) {
      const hourTime = time + i * oneHour;
      const events = liverEventMap.get(hourTime) || [];

      timeSectionList.push({
        time: hourTime,
        events,
      });
    }
    dateSectionList.push({
      time,
      date: new Date(time),
      timeSectionList,
    });
  }

  // イベントがある日のみに絞り込む
  return dateSectionList.filter((dateSection) => {
    return dateSection.timeSectionList.some((section) => section.events.length > 0);
  });
}
