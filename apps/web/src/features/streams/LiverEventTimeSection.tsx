/**
 * 時間帯単位のセクション。同じ開始時刻の配信をグリッド表示する。
 *
 * 時間帯に応じた背景色（深夜・朝・昼・夕方・夜）で視覚的に区別し、現在時刻のセクションには「now」インジケーターを表示する。
 */
import type { TimeSection } from "@liver-streams/core";
import { hhmmDateFormatter } from "@liver-streams/core";
import { computed, defineVaporComponent, VaporTransitionGroup } from "vue";
import { useDateStore } from "../../shared/stores";
import LiverEventCard from "./LiverEventCard";

type Props = {
  section: TimeSection;
  nextSection: TimeSection | undefined;
  isCurrentTime: boolean;
};

function getTimeColor(hour: number) {
  return "var(--hour" + hour + ")";
}

export default defineVaporComponent(
  (props: Props) => {
    const dateStore = useDateStore();

    const hasEvents = computed(() => props.section.events.length > 0);
    const hour = computed(() => new Date(props.section.time).getHours());
    const sectionBackground = computed(() => getTimeColor(hour.value));
    const hhss = computed(() => hhmmDateFormatter.format(dateStore.currentTime));

    return (
      <section
        class="flex scroll-m-8 flex-col items-center gap-[20px] pt-3"
        data-id="time-section"
        data-time={props.section.time}
        style={{ background: sectionBackground.value }}
      >
        {props.isCurrentTime && (
          <div class="pointer-events-none flex w-full">
            <div class="mt-8 flex items-center gap-2 bg-black/70 py-1 pr-12 pl-2 text-base font-bold text-white select-none [clip-path:polygon(0%_0%,85%_0%,100%_45%,100%_55%,85%_100%,0%_100%)]">
              <i class="i-mdi-clock-outline size-6" />
              <p>now {hhss.value}</p>
            </div>
          </div>
        )}
        {hasEvents.value && (
          <>
            <div class="pointer-events-none flex w-full items-baseline justify-start gap-[2px] px-[clamp(2px,2px+0.5vw,16px)] font-['Poppins'] leading-none font-bold text-gray-800/30 select-none">
              <span class="text-5xl tracking-tight drop-shadow-md">
                {hour.value.toFixed(0).padStart(2, "0")}
              </span>
              <span class="text-3xl drop-shadow-md">:00</span>
            </div>
            <div class="grid w-full grid-cols-[repeat(auto-fill,minmax(410px,1fr))] gap-x-[clamp(2px,2px+0.5vw,12px)] gap-y-[28px] px-[clamp(2px,2px+0.5vw,16px)] pb-8 max-xl:grid-cols-[repeat(auto-fill,minmax(360px,1fr))]">
              <VaporTransitionGroup name="time-section-card">
                {props.section.events.map((liverEvent) => (
                  <LiverEventCard key={liverEvent.id} liverEvent={liverEvent} />
                ))}
              </VaporTransitionGroup>
            </div>
          </>
        )}
      </section>
    );
  },
  { name: "LiverEventTimeSection", props: ["section", "nextSection", "isCurrentTime"] },
);
