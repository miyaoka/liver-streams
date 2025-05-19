import { describe, it, expect } from "vitest";
import { getYouTubeVideoId, getThumbnail } from "./youtube";

describe("getYouTubeVideoId", () => {
  it("should return the video ID from a standard YouTube URL", () => {
    const url = "https://www.youtube.com/watch?v=VIDEO_ID";
    const expected = "VIDEO_ID";
    expect(getYouTubeVideoId(url)).toBe(expected);
  });

  it("should return the video ID from a shortened YouTube URL", () => {
    const url = "https://youtu.be/VIDEO_ID";
    const expected = "VIDEO_ID";
    expect(getYouTubeVideoId(url)).toBe(expected);
  });

  it("should return the video ID from an embedded YouTube URL", () => {
    const url = "https://www.youtube.com/v/VIDEO_ID";
    const expected = "VIDEO_ID";
    expect(getYouTubeVideoId(url)).toBe(expected);
  });

  it("should return the video ID from an embedded YouTube URL", () => {
    const url = "https://www.youtube.com/embed/VIDEO_ID";
    const expected = "VIDEO_ID";
    expect(getYouTubeVideoId(url)).toBe(expected);
  });

  it("should return the video ID from a YouTube live URL", () => {
    const url = "https://www.youtube.com/live/VIDEO_ID";
    const expected = "VIDEO_ID";
    expect(getYouTubeVideoId(url)).toBe(expected);
  });

  it("should return undefined if the URL does not contain a video ID", () => {
    const url = "https://www.youtube.com/";
    expect(getYouTubeVideoId(url)).toBeUndefined();
  });

  it("should return the video ID from a YouTube URL with additional parameters", () => {
    const url = "https://www.youtube.com/watch?v=VIDEO_ID&feature=youtu.be";
    const expected = "VIDEO_ID";
    expect(getYouTubeVideoId(url)).toBe(expected);
  });
});

describe("getThumbnail", () => {
  it("returns mq quality thumbnail url", () => {
    const url = "https://i.ytimg.com/vi/VIDEO_ID/default.jpg";
    const expected = "https://i.ytimg.com/vi/VIDEO_ID/mqdefault.jpg";
    expect(getThumbnail(url, "mq")).toBe(expected);
  });

  it("returns hq quality thumbnail url", () => {
    const url = "https://i.ytimg.com/vi/VIDEO_ID/default.jpg";
    const expected = "https://i.ytimg.com/vi/VIDEO_ID/hqdefault.jpg";
    expect(getThumbnail(url, "hq")).toBe(expected);
  });

  it("returns sd quality thumbnail url", () => {
    const url = "https://i.ytimg.com/vi/VIDEO_ID/default.jpg";
    const expected = "https://i.ytimg.com/vi/VIDEO_ID/sddefault.jpg";
    expect(getThumbnail(url, "sd")).toBe(expected);
  });

  it("returns maxres quality thumbnail url", () => {
    const url = "https://i.ytimg.com/vi/VIDEO_ID/default.jpg";
    const expected = "https://i.ytimg.com/vi/VIDEO_ID/maxresdefault.jpg";
    expect(getThumbnail(url, "maxres")).toBe(expected);
  });

  it("keeps url unchanged for empty quality", () => {
    const url = "https://i.ytimg.com/vi/VIDEO_ID/default.jpg";
    const expected = "https://i.ytimg.com/vi/VIDEO_ID/default.jpg";
    expect(getThumbnail(url, "")).toBe(expected);
  });

  it("handles live thumbnails", () => {
    const url = "https://i.ytimg.com/vi/VIDEO_ID/default_live.jpg";
    const expected = "https://i.ytimg.com/vi/VIDEO_ID/hqdefault_live.jpg";
    expect(getThumbnail(url, "hq")).toBe(expected);
  });

  it("returns original url when parsing fails", () => {
    const url = "https://example.com/image.jpg";
    expect(getThumbnail(url, "hq")).toBe(url);
  });
});
