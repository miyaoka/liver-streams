/**
 * 新着イベント一覧の各アイテム表示。未読マーク付きで表示し、クリックでカードにスクロールする。
 */
import type { LiverEvent } from "@liver-streams/core";
import { compareDate, getDateTime, hhmmDateFormatter, toRelativeTime } from "@liver-streams/core";
import { scrollToLiverEventTop } from "../../shared/lib";
import { selectCurrentDateTime, useDateStore, useHoverStore } from "../../shared/stores";

type Props = {
  liverEvent: LiverEvent;
  addedTime: number;
  lastCloseTime: number;
};

function getEventTime(startAt: Date, currentDateTime: number) {
  const startDateTime = getDateTime(startAt);

  const dateDiff = compareDate({
    baseDateTime: currentDateTime,
    targetDateTime: startDateTime,
  });

  // 今日なら時刻を返す
  if (dateDiff === 0) {
    return hhmmDateFormatter.format(startAt);
  }

  // 別の日なら相対時刻を返す
  return toRelativeTime(startDateTime - currentDateTime);
}

export default function NewArrivalsListItem({ liverEvent, addedTime, lastCloseTime }: Props) {
  const currentDateTime = useDateStore(selectCurrentDateTime);
  const hoverEvent = useHoverStore((state) => state.hoverEvent);
  const unhoverEvent = useHoverStore((state) => state.unhoverEvent);

  const eventTime = getEventTime(liverEvent.startAt, currentDateTime);
  const isUnread = addedTime > lastCloseTime;

  function onClickEvent() {
    scrollToLiverEventTop(liverEvent.id);
  }

  return (
    <button
      className="relative flex flex-row items-center gap-2 p-2 text-start hover:bg-slate-200"
      popoverTarget={liverEvent.id}
      onClick={onClickEvent}
      onMouseOver={() => hoverEvent(liverEvent)}
      onMouseLeave={unhoverEvent}
    >
      <img
        src={liverEvent.talent.image}
        loading="lazy"
        className="size-8 rounded-full"
        title={liverEvent.talent.name}
      />
      <p className="line-clamp-2 flex-1 text-sm wrap-anywhere">{liverEvent.title}</p>
      <p className="w-12 text-right text-sm">{eventTime}</p>
      {isUnread && <i className="absolute top-2 right-0 i-mdi-circle size-2 text-red-700" />}
    </button>
  );
}
