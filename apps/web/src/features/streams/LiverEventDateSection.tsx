/**
 * 日付単位のセクション。1日分の配信をまとめて表示する。
 *
 * ヘッダーに日付と「今日」「明日」などの相対表記を表示し、クリックでセクション先頭にスクロールする。
 */
import type { DateSection } from "@liver-streams/core";
import { compareDate, mdDateFormatter, relativeDateFormatter } from "@liver-streams/core";
import { computed, defineVaporComponent } from "vue";
import { VaporFor } from "vue-jsx-vapor";
import { scrollToSectionTop } from "../../shared/lib";
import { useDateStore } from "../../shared/stores";
import LiverEventTimeSection from "./LiverEventTimeSection";

type Props = {
  dateSection: DateSection;
  prevSection: DateSection | undefined;
  nextSection: DateSection | undefined;
};

export default defineVaporComponent(
  (props: Props) => {
    const dateStore = useDateStore();

    const sectionInfo = computed(() => {
      const dateDiff = compareDate({
        baseDateTime: dateStore.currentDateTime,
        targetDateTime: props.dateSection.date.getTime(),
      });

      return {
        dateDiff,
        relative: relativeDateFormatter.format(dateDiff, "days"),
        mmdd: mdDateFormatter.format(props.dateSection.date),
      };
    });

    return (
      <section
        class="relative pt-0 pb-12"
        data-id="date-section"
        data-time={`${props.dateSection.time}`}
      >
        <div class="absolute -top-1 w-full border-t-2 border-dashed border-white/80" />
        <header class="pointer-events-none sticky top-0 z-30 flex pt-2 pl-2">
          <button
            class={[
              "pointer-events-auto flex flex-row items-center gap-1 rounded-lg border-0 px-2 py-1 shadow-md",
              {
                "border-yellow-100 bg-yellow-400 text-black hover:bg-yellow-500":
                  sectionInfo.value.dateDiff === 0,
                "border-gray-300 bg-gray-100 text-gray-900 hover:bg-gray-200":
                  sectionInfo.value.dateDiff > 0,
                "border-gray-300 bg-gray-700  text-gray-300 hover:bg-gray-800":
                  sectionInfo.value.dateDiff < 0,
              },
            ]}
            onClick={() => scrollToSectionTop(props.dateSection.time)}
          >
            <span class="text-base font-bold">
              {sectionInfo.value.mmdd} {sectionInfo.value.relative}
            </span>
          </button>
        </header>
        <VaporFor in={props.dateSection.timeSectionList} getKey={(section) => section.time}>
          {(section, i) => (
            <LiverEventTimeSection
              section={section.value}
              nextSection={props.dateSection.timeSectionList[i.value + 1]}
              isCurrentTime={section.value.time === dateStore.currentHourTime}
            />
          )}
        </VaporFor>
      </section>
    );
  },
  { name: "LiverEventDateSection", props: ["dateSection", "prevSection", "nextSection"] },
);
