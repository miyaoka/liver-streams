/**
 * 日付単位のセクション。1日分の配信をまとめて表示する。
 *
 * ヘッダーに日付と「今日」「明日」などの相対表記を表示し、クリックでセクション先頭にスクロールする。
 */
import type { DateSection } from "@liver-streams/core";
import { compareDate, mdDateFormatter, relativeDateFormatter } from "@liver-streams/core";
import { classNames, scrollToSectionTop } from "../../shared/lib";
import { selectCurrentDateTime, selectCurrentHourTime, useDateStore } from "../../shared/stores";
import LiverEventTimeSection from "./LiverEventTimeSection";

type Props = {
  dateSection: DateSection;
  prevSection: DateSection | undefined;
  nextSection: DateSection | undefined;
};

export default function LiverEventDateSection({ dateSection }: Props) {
  const currentDateTime = useDateStore(selectCurrentDateTime);
  const currentHourTime = useDateStore(selectCurrentHourTime);

  const dateDiff = compareDate({
    baseDateTime: currentDateTime,
    targetDateTime: dateSection.date.getTime(),
  });
  const relative = relativeDateFormatter.format(dateDiff, "days");
  const mmdd = mdDateFormatter.format(dateSection.date);

  const buttonClassName = classNames(
    "pointer-events-auto flex flex-row items-center gap-1 rounded-lg border-0 px-2 py-1 shadow-md",
    dateDiff === 0 && "border-yellow-100 bg-yellow-400 text-black hover:bg-yellow-500",
    dateDiff > 0 && "border-gray-300 bg-gray-100 text-gray-900 hover:bg-gray-200",
    dateDiff < 0 && "border-gray-300 bg-gray-700  text-gray-300 hover:bg-gray-800",
  );

  return (
    <section
      className="relative pt-0 pb-12"
      data-id="date-section"
      data-time={`${dateSection.time}`}
    >
      <div className="absolute -top-1 w-full border-t-2 border-dashed border-white/80" />
      <header className="pointer-events-none sticky top-0 z-30 flex pt-2 pl-2">
        <button className={buttonClassName} onClick={() => scrollToSectionTop(dateSection.time)}>
          <span className="text-base font-bold">
            {mmdd} {relative}
          </span>
        </button>
      </header>
      {dateSection.timeSectionList.map((section, i) => (
        <LiverEventTimeSection
          key={section.time}
          section={section}
          nextSection={dateSection.timeSectionList[i + 1]}
          isCurrentTime={section.time === currentHourTime}
        />
      ))}
    </section>
  );
}
