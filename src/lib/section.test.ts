import { describe, it, expect } from "vitest";
import { createDateSectionList } from "./section";
import type { LiverEvent } from "@/services/api";

function createEvent(id: string, startAt: string): LiverEvent {
  return {
    id,
    title: "",
    url: "",
    thumbnail: "",
    startAt: new Date(startAt),
    endAt: null,
    isLive: false,
    talent: { name: `talent${id}`, image: "" },
    collaboTalents: [],
    affiliation: "hololive",
    hashtagList: [],
    hashtagSet: new Set(),
    collaboTalentSet: new Set(),
    keywordList: [],
  };
}

describe("createDateSectionList", () => {
  it("日時ごとにイベントをグループ化する", () => {
    const events: LiverEvent[] = [
      createEvent("1", "2024-01-01T00:10:00Z"),
      createEvent("2", "2024-01-01T01:20:00Z"),
      createEvent("3", "2024-01-02T00:05:00Z"),
    ];
    const list = createDateSectionList(events);
    expect(list.length).toBe(2);
    const firstDay = list[0].timeSectionList;
    const secondDay = list[1].timeSectionList;
    expect(firstDay.find((s) => s.events.some((e) => e.id === "1"))).toBeDefined();
    expect(firstDay.find((s) => s.events.some((e) => e.id === "2"))).toBeDefined();
    expect(secondDay.find((s) => s.events.some((e) => e.id === "3"))).toBeDefined();
  });
});
