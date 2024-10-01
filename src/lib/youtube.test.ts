import { describe, it, expect } from "vitest";
import { getYouTubeVideoId } from "./youtube";

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
