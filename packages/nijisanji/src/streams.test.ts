import { describe, it, expect } from "bun:test";
import { toNijiStreams } from "./streams";
import type { NijisanjiApiStream } from "./streams";

function createStream(overrides: Partial<NijisanjiApiStream> = {}): NijisanjiApiStream {
  return {
    title: "配信タイトル",
    url: "https://www.youtube.com/watch?v=abc",
    "thumbnail-url": "https://i.ytimg.com/vi/abc/maxresdefault.jpg",
    "fallback-thumbnail-url": "https://i.ytimg.com/vi/abc/sddefault.jpg",
    "start-at": "2026-10-02T21:00:00.000+09:00",
    "end-at": null,
    status: "not_on_air",
    id: "stream-1",
    platform: "youtube",
    channel: {
      name: "チャンネル",
      "thumbnail-url": "https://example.com/channel.jpg",
      main: true,
      id: "channel-1",
      liver: { "external-id": "talent-1", id: "liver-1" },
    },
    "event-livers": [{ "external-id": "talent-2", id: "liver-2" }],
    ...overrides,
  };
}

describe("toNijiStreams", () => {
  it("YouTube の配信をアプリの形式に変換する", () => {
    expect(toNijiStreams([createStream({ status: "on_air" })])).toEqual([
      {
        title: "配信タイトル",
        url: "https://www.youtube.com/watch?v=abc",
        thumbnail: "https://i.ytimg.com/vi/abc/maxresdefault.jpg",
        startAt: "2026-10-02T21:00:00.000+09:00",
        endAt: null,
        isLive: true,
        talentId: "talent-1",
        collaboTalentIds: ["talent-2"],
      },
    ]);
  });

  it("twitch の配信を除外する", () => {
    expect(toNijiStreams([createStream({ platform: "twitch" })])).toEqual([]);
  });

  it("thumbnail-url が null なら fallback-thumbnail-url を使う", () => {
    const [stream] = toNijiStreams([createStream({ "thumbnail-url": null })]);
    expect(stream?.thumbnail).toBe("https://i.ytimg.com/vi/abc/sddefault.jpg");
  });
});
