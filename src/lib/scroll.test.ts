import { describe, it, expect, vi } from "vitest";
import { scrollToCurrentTime } from "./scroll";
import type { DateSection } from "./section";

function createDateSection(times: number[]): DateSection {
  return {
    time: times[0],
    date: new Date(times[0]),
    timeSectionList: times.map((t) => ({ time: t, events: [] })),
  };
}

describe("scrollToCurrentTime", () => {
  it("afterNowIndexが0の場合は最初のタイムセクションが選択される", () => {
    const dateSectionList: DateSection[] = [createDateSection([1000, 2000])];
    const dateNowSpy = vi.spyOn(Date, "now").mockReturnValue(500);

    const first = document.createElement("div");
    first.dataset.id = "time-section";
    first.dataset.time = "1000";
    const firstSpy = vi.fn();
    first.scrollIntoView = firstSpy;

    const second = document.createElement("div");
    second.dataset.id = "time-section";
    second.dataset.time = "2000";
    const secondSpy = vi.fn();
    second.scrollIntoView = secondSpy;

    document.body.append(first, second);

    scrollToCurrentTime(dateSectionList, { behavior: "instant" });

    expect(firstSpy).toHaveBeenCalled();
    expect(secondSpy).not.toHaveBeenCalled();

    first.remove();
    second.remove();
    dateNowSpy.mockRestore();
  });
});
