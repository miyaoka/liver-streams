/**
 * 時間帯単位のセクション。同じ開始時刻の配信をグリッド表示する。
 *
 * 時間帯に応じた背景色（深夜・朝・昼・夕方・夜）で視覚的に区別し、現在時刻のセクションには「now」インジケーターを表示する。
 */
import type { TimeSection } from "@liver-streams/core";
import { hhmmDateFormatter } from "@liver-streams/core";
import { useState } from "react";
import { selectCurrentTime, useDateStore } from "../../shared/stores";
import LiverEventCard from "./LiverEventCard";

type Props = {
  section: TimeSection;
  nextSection: TimeSection | undefined;
  isCurrentTime: boolean;
};

function getTimeColor(hour: number) {
  return "var(--hour" + hour + ")";
}

export default function LiverEventTimeSection({ section, isCurrentTime }: Props) {
  // 現在時刻のセクションだけが時刻の表示を購読する
  const hhss = useDateStore((state) =>
    isCurrentTime ? hhmmDateFormatter.format(selectCurrentTime(state)) : null,
  );
  const [initialEventIdSet] = useState(() => new Set(section.events.map((event) => event.id)));

  const hasEvents = section.events.length > 0;
  const hour = new Date(section.time).getHours();
  const sectionBackground = getTimeColor(hour);

  return (
    <section
      className="flex scroll-m-8 flex-col items-center gap-[20px] pt-3"
      data-id="time-section"
      data-time={section.time}
      style={{ background: sectionBackground }}
    >
      {isCurrentTime && (
        <div className="pointer-events-none flex w-full">
          <div className="mt-8 flex items-center gap-2 bg-black/70 py-1 pr-12 pl-2 text-base font-bold text-white select-none [clip-path:polygon(0%_0%,85%_0%,100%_45%,100%_55%,85%_100%,0%_100%)]">
            <i className="i-mdi-clock-outline size-6" />
            <p>now {hhss}</p>
          </div>
        </div>
      )}
      {hasEvents && (
        <>
          <div className="pointer-events-none flex w-full items-baseline justify-start gap-[2px] px-[clamp(2px,2px+0.5vw,16px)] font-['Poppins'] leading-none font-bold text-gray-800/30 select-none">
            <span className="text-5xl tracking-tight drop-shadow-md">
              {hour.toFixed(0).padStart(2, "0")}
            </span>
            <span className="text-3xl drop-shadow-md">:00</span>
          </div>
          <div className="grid w-full grid-cols-[repeat(auto-fill,minmax(410px,1fr))] gap-x-[clamp(2px,2px+0.5vw,12px)] gap-y-[28px] px-[clamp(2px,2px+0.5vw,16px)] pb-8 max-xl:grid-cols-[repeat(auto-fill,minmax(360px,1fr))]">
            {section.events.map((liverEvent) => (
              <LiverEventCard
                key={liverEvent.id}
                liverEvent={liverEvent}
                animateEnter={!initialEventIdSet.has(liverEvent.id)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
